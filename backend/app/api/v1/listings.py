from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.core.deps import get_db, get_current_user, get_optional_current_user
from backend.app.models.listing import Listing, ListingImage
from backend.app.models.moderation import Block
from backend.app.models.user import User
from backend.app.models.transaction import Transaction
from backend.app.models.message import Message
from backend.app.schemas.listing import ListingCreate, ListingUpdate, ListingOut, ListingInquiry
from backend.app.schemas.transaction import TransactionOut

router = APIRouter(prefix="/listings", tags=["Marketplace Listings"])


@router.get("", response_model=list[ListingOut])
def list_listings(
    category: Optional[str] = None,
    listing_mode: Optional[str] = None,
    q: Optional[str] = None,
    status_filter: Optional[str] = Query("available", alias="status"),
    campus_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    query = db.query(Listing)

    if current_user and not campus_id:
        query = query.filter(Listing.campus_id == current_user.campus_id)
    elif campus_id:
        query = query.filter(Listing.campus_id == campus_id)

    if current_user:
        blocked_ids = [
            b.blocked_id for b in db.query(Block.blocked_id).filter(Block.blocker_id == current_user.id).all()
        ]
        if blocked_ids:
            query = query.filter(~Listing.owner_id.in_(blocked_ids))

    if status_filter and status_filter != "all":
        query = query.filter(Listing.availability_status == status_filter)

    if category and category.lower() != "all":
        query = query.filter(Listing.category.ilike(category))

    if listing_mode and listing_mode.lower() != "all":
        query = query.filter(Listing.listing_mode == listing_mode)

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Listing.title.ilike(search),
                Listing.description.ilike(search),
                Listing.category.ilike(search),
                Listing.pickup_area.ilike(search),
            )
        )

    return query.order_by(Listing.created_at.desc()).all()


@router.post("", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = Listing(
        owner_id=current_user.id,
        campus_id=current_user.campus_id,
        title=listing_in.title,
        description=listing_in.description,
        category=listing_in.category,
        listing_mode=listing_in.listing_mode,
        price=listing_in.price,
        condition=listing_in.condition,
        pickup_area=listing_in.pickup_area,
        availability_status="available",
    )
    db.add(listing)
    db.flush()

    for idx, img_url in enumerate(listing_in.image_urls):
        img = ListingImage(
            listing_id=listing.id,
            image_url=img_url,
            sort_order=idx
        )
        db.add(img)

    db.commit()
    db.refresh(listing)
    return listing


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: str, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return listing


@router.patch("/{listing_id}", response_model=ListingOut)
def update_listing(
    listing_id: str,
    listing_update: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this listing")

    update_data = listing_update.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(listing, k, v)

    db.commit()
    db.refresh(listing)
    return listing


@router.delete("/{listing_id}", status_code=status.HTTP_200_OK)
def archive_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this listing")

    # Soft delete / archive
    listing.availability_status = "archived"
    db.commit()
    return {"message": "Listing archived successfully"}


@router.post("/{listing_id}/inquire", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def inquire_listing(
    listing_id: str,
    inquiry_in: ListingInquiry,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.owner_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot request your own listing")
    if listing.availability_status != "available":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Listing is currently {listing.availability_status}")

    # Check if active transaction already exists between these users for this item
    existing_txn = db.query(Transaction).filter(
        Transaction.listing_id == listing.id,
        Transaction.requester_or_buyer_id == current_user.id,
        Transaction.status.in_(["accepted", "in_progress"])
    ).first()
    if existing_txn:
        msg = Message(
            sender_id=current_user.id,
            recipient_id=listing.owner_id,
            related_type="listing",
            related_id=listing.id,
            content=inquiry_in.message,
        )
        db.add(msg)
        db.commit()
        return existing_txn

    # Create new transaction
    txn = Transaction(
        listing_id=listing.id,
        requester_or_buyer_id=current_user.id,
        provider_or_owner_id=listing.owner_id,
        status="in_progress",
    )
    db.add(txn)
    db.flush()

    # Record inquiry message
    content = inquiry_in.message
    if inquiry_in.proposed_meeting_spot:
        content += f"\n\nPreferred meeting spot: {inquiry_in.proposed_meeting_spot}"

    msg = Message(
        sender_id=current_user.id,
        recipient_id=listing.owner_id,
        related_type="listing",
        related_id=listing.id,
        content=content,
    )
    db.add(msg)
    db.commit()
    db.refresh(txn)
    return txn
