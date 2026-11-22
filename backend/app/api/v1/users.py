from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.core.deps import get_db, get_current_user
from backend.app.models.user import User
from backend.app.models.review import Review
from backend.app.models.moderation import Block
from backend.app.models.transaction import Transaction
from backend.app.models.request import Request, Offer
from backend.app.schemas.user import UserOut, UserPublicOut, UserUpdate
from backend.app.schemas.transaction import ReviewOut, TransactionOut
from backend.app.schemas.request import RequestOut
from backend.app.schemas.offer import OfferOut

router = APIRouter(prefix="/users", tags=["Users & Profiles"])


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_current_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = user_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(current_user, field, val)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/activity", response_model=dict)
def get_my_unified_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Unified activity center:
    - Posted requests & incoming offers
    - Offers sent by user
    - Active tasks/interactions
    - Completed history & review status
    """
    # 1. My posted requests
    my_requests = db.query(Request).filter(
        Request.requester_id == current_user.id
    ).order_by(Request.created_at.desc()).all()

    formatted_requests = []
    for r in my_requests:
        ro = RequestOut.model_validate(r)
        ro.offers_count = len(r.offers)
        ro.offers = [OfferOut.model_validate(o) for o in r.offers]
        formatted_requests.append(ro.model_dump())

    # 2. Offers I sent to others
    my_offers = db.query(Offer).filter(
        Offer.provider_id == current_user.id
    ).order_by(Offer.created_at.desc()).all()

    formatted_offers = []
    for o in my_offers:
        offer_dict = OfferOut.model_validate(o).model_dump()
        offer_dict["request_title"] = o.request.title if o.request else "Campus Request"
        offer_dict["request_category"] = o.request.category if o.request else ""
        offer_dict["request_status"] = o.request.status if o.request else ""
        offer_dict["requester_name"] = o.request.requester.full_name if o.request and o.request.requester else "Student"
        formatted_offers.append(offer_dict)

    # 3. Active tasks (accepted or in_progress)
    active_txns = db.query(Transaction).filter(
        or_(
            Transaction.requester_or_buyer_id == current_user.id,
            Transaction.provider_or_owner_id == current_user.id,
        ),
        Transaction.status.in_(["accepted", "in_progress"])
    ).order_by(Transaction.updated_at.desc()).all()

    # 4. Completed tasks
    completed_txns = db.query(Transaction).filter(
        or_(
            Transaction.requester_or_buyer_id == current_user.id,
            Transaction.provider_or_owner_id == current_user.id,
        ),
        Transaction.status == "completed"
    ).order_by(Transaction.completed_at.desc().nullslast()).all()

    # 5. Cancelled tasks
    cancelled_txns = db.query(Transaction).filter(
        or_(
            Transaction.requester_or_buyer_id == current_user.id,
            Transaction.provider_or_owner_id == current_user.id,
        ),
        Transaction.status == "cancelled"
    ).order_by(Transaction.updated_at.desc()).all()

    # 6. Reviews and reputation
    user_reviews = db.query(Review).filter(Review.reviewee_id == current_user.id).all()
    avg_rating = sum(r.rating for r in user_reviews) / len(user_reviews) if user_reviews else 5.0

    return {
        "posted_requests": formatted_requests,
        "offers_sent": formatted_offers,
        "active_tasks": [TransactionOut.model_validate(t).model_dump() for t in active_txns],
        "completed_tasks": [TransactionOut.model_validate(t).model_dump() for t in completed_txns],
        "cancelled_tasks": [TransactionOut.model_validate(t).model_dump() for t in cancelled_txns],
        "stats": {
            "open_requests_count": sum(1 for r in my_requests if r.status == "open"),
            "active_tasks_count": len(active_txns),
            "pending_offers_count": sum(1 for o in my_offers if o.status == "pending"),
            "completed_tasks_count": len(completed_txns),
            "total_posted": len(my_requests),
            "total_offers_sent": len(my_offers),
            "active_tasks": len(active_txns),
            "completed_tasks": len(completed_txns),
            "cancelled_tasks": len(cancelled_txns),
            "reputation_score": round(avg_rating, 1),
        }
    }


@router.get("/{user_id}", response_model=dict)
def get_user_public_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Calculate review average & stats
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()
    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0.0

    completed_tasks = db.query(Transaction).filter(
        ((Transaction.requester_or_buyer_id == user_id) | (Transaction.provider_or_owner_id == user_id)),
        Transaction.status == "completed"
    ).count()

    return {
        "user": UserPublicOut.model_validate(user).model_dump(),
        "stats": {
            "total_reviews": len(reviews),
            "average_rating": round(avg_rating, 1),
            "completed_exchanges": completed_tasks,
        }
    }


@router.get("/{user_id}/reviews", response_model=list[ReviewOut])
def get_user_reviews(user_id: str, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.reviewee_id == user_id).order_by(Review.created_at.desc()).all()


@router.post("/{user_id}/block", status_code=status.HTTP_201_CREATED)
def block_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot block yourself")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing_block = db.query(Block).filter(
        Block.blocker_id == current_user.id,
        Block.blocked_id == user_id
    ).first()

    if not existing_block:
        block = Block(blocker_id=current_user.id, blocked_id=user_id)
        db.add(block)
        db.commit()

    return {"message": "User blocked successfully"}


@router.delete("/{user_id}/block", status_code=status.HTTP_200_OK)
def unblock_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    block = db.query(Block).filter(
        Block.blocker_id == current_user.id,
        Block.blocked_id == user_id
    ).first()
    if block:
        db.delete(block)
        db.commit()
    return {"message": "User unblocked successfully"}
