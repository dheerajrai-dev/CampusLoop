from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.core.deps import get_db, get_current_user, get_optional_current_user
from backend.app.models.request import Request, Offer
from backend.app.models.transaction import Transaction
from backend.app.models.moderation import Block
from backend.app.models.user import User
from backend.app.schemas.request import RequestCreate, RequestUpdate, RequestOut
from backend.app.schemas.offer import OfferCreate, OfferUpdate, OfferOut

router = APIRouter(prefix="/requests", tags=["Request Board"])


@router.get("", response_model=list[RequestOut])
def list_requests(
    category: Optional[str] = None,
    q: Optional[str] = None,
    status_filter: Optional[str] = Query("open", alias="status"),
    campus_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    query = db.query(Request)
    
    # Campus isolation: use user's campus if signed in, or explicit campus_id filter
    if current_user and not campus_id:
        query = query.filter(Request.campus_id == current_user.campus_id)
    elif campus_id:
        query = query.filter(Request.campus_id == campus_id)

    # Filter out blocked users
    if current_user:
        blocked_ids = [
            b.blocked_id for b in db.query(Block.blocked_id).filter(Block.blocker_id == current_user.id).all()
        ]
        if blocked_ids:
            query = query.filter(~Request.requester_id.in_(blocked_ids))

    if status_filter and status_filter != "all":
        query = query.filter(Request.status == status_filter)

    if category and category.lower() != "all":
        query = query.filter(Request.category.ilike(category))

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Request.title.ilike(search),
                Request.description.ilike(search),
                Request.category.ilike(search),
            )
        )

    requests = query.order_by(Request.created_at.desc()).all()
    
    results = []
    for r in requests:
        out = RequestOut.model_validate(r)
        out.offers_count = len(r.offers)
        results.append(out)
    return results


@router.post("", response_model=RequestOut, status_code=status.HTTP_201_CREATED)
def create_request(
    req_in: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = Request(
        requester_id=current_user.id,
        campus_id=current_user.campus_id,
        title=req_in.title,
        description=req_in.description,
        category=req_in.category,
        request_type=req_in.request_type,
        budget=req_in.budget,
        preferred_arrangement=req_in.preferred_arrangement,
        deadline=req_in.deadline,
        status="open",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/{request_id}", response_model=RequestOut)
def get_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    out = RequestOut.model_validate(req)
    out.offers_count = len(req.offers)

    # Privacy rule: Only request owner sees all offers; other students only see their own offer
    if current_user:
        if current_user.id == req.requester_id:
            out.offers = [OfferOut.model_validate(o) for o in req.offers]
        else:
            out.offers = [
                OfferOut.model_validate(o) for o in req.offers if o.provider_id == current_user.id
            ]
    else:
        out.offers = []

    return out


@router.patch("/{request_id}", response_model=RequestOut)
def update_request(
    request_id: str,
    req_update: RequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if req.requester_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this request")

    update_data = req_update.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(req, k, v)

    db.commit()
    db.refresh(req)
    return req


@router.post("/{request_id}/offers", response_model=OfferOut, status_code=status.HTTP_201_CREATED)
def submit_offer(
    request_id: str,
    offer_in: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    # Campus isolation
    if req.campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You can only submit offers within your campus"
        )

    # Cannot offer on own request
    if req.requester_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot submit an offer to your own request"
        )

    # Check request status
    if req.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit offer to a request with status '{req.status}'"
        )

    # Prevent duplicate active offer from same provider
    existing_offer = db.query(Offer).filter(
        Offer.request_id == request_id,
        Offer.provider_id == current_user.id,
        Offer.status.in_(["pending", "accepted"])
    ).first()
    if existing_offer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active offer for this request. Please withdraw or update it."
        )

    offer = Offer(
        request_id=request_id,
        provider_id=current_user.id,
        message=offer_in.message,
        proposed_price=offer_in.proposed_price,
        availability_note=offer_in.availability_note,
        status="pending",
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


@router.get("/{request_id}/offers", response_model=list[OfferOut])
def get_request_offers(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if req.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the request owner can view all submitted offers"
        )
    return db.query(Offer).filter(Offer.request_id == request_id).order_by(Offer.created_at.desc()).all()


@router.patch("/offers/{offer_id}/accept", response_model=OfferOut)
def accept_offer(
    offer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    req = db.query(Request).filter(Request.id == offer.request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated request not found")

    # Only request owner can accept
    if req.requester_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the requester can accept this offer")

    # Provider cannot accept their own offer
    if offer.provider_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot accept your own offer")

    # Enforce request open state
    if req.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This request is already '{req.status}'. An offer cannot be accepted."
        )

    # Enforce offer pending state
    if offer.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This offer is already '{offer.status}'."
        )

    # Atomic acceptance & transaction creation
    offer.status = "accepted"
    req.status = "assigned"

    # Reject other pending offers
    db.query(Offer).filter(
        Offer.request_id == req.id,
        Offer.id != offer.id,
        Offer.status == "pending"
    ).update({"status": "rejected"})

    # Create transaction record
    transaction = Transaction(
        request_id=req.id,
        offer_id=offer.id,
        requester_or_buyer_id=req.requester_id,
        provider_or_owner_id=offer.provider_id,
        status="accepted",
        completion_confirmed_by_requester=False,
        completion_confirmed_by_provider=False,
    )
    db.add(transaction)
    db.commit()
    db.refresh(offer)
    return offer


@router.patch("/offers/{offer_id}/reject", response_model=OfferOut)
def reject_offer(
    offer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    req = db.query(Request).filter(Request.id == offer.request_id).first()

    if req.requester_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the requester can reject this offer")

    offer.status = "rejected"
    db.commit()
    db.refresh(offer)
    return offer


@router.patch("/offers/{offer_id}/withdraw", response_model=OfferOut)
def withdraw_offer(
    offer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if offer.provider_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the offer provider can withdraw this offer")

    if offer.status not in ["pending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot withdraw an offer with status '{offer.status}'"
        )

    offer.status = "withdrawn"
    db.commit()
    db.refresh(offer)
    return offer
