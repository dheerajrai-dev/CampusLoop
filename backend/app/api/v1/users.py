from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.deps import get_db, get_current_user
from backend.app.models.user import User
from backend.app.models.review import Review
from backend.app.models.moderation import Block
from backend.app.models.transaction import Transaction
from backend.app.schemas.user import UserOut, UserPublicOut, UserUpdate
from backend.app.schemas.transaction import ReviewOut

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


@router.get("/{user_id}", response_model=dict)
def get_user_public_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Calculate review average & stats
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()
    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0.0
    
    # Completed transactions count
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
