from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.core.deps import get_db, get_current_user
from backend.app.models.transaction import Transaction
from backend.app.models.review import Review
from backend.app.models.request import Request, Offer
from backend.app.models.user import User
from backend.app.schemas.transaction import (
    TransactionOut,
    TransactionStatusUpdate,
    TransactionCancel,
    ReviewCreate,
    ReviewOut,
)

router = APIRouter(prefix="/transactions", tags=["Transactions & Reviews"])


@router.get("/me", response_model=list[TransactionOut])
def get_my_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = db.query(Transaction).filter(
        or_(
            Transaction.requester_or_buyer_id == current_user.id,
            Transaction.provider_or_owner_id == current_user.id,
        )
    ).order_by(Transaction.updated_at.desc()).all()
    return transactions


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if current_user.id not in [txn.requester_or_buyer_id, txn.provider_or_owner_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only transaction participants can access this transaction"
        )

    return txn


@router.patch("/{transaction_id}/status", response_model=TransactionOut)
def update_transaction_status(
    transaction_id: str,
    status_update: TransactionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if current_user.id not in [txn.requester_or_buyer_id, txn.provider_or_owner_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only transaction participants can change status"
        )

    new_status = status_update.status
    allowed_transitions = {
        "accepted": ["in_progress", "cancelled"],
        "in_progress": ["completed", "cancelled"],
        "completed": [],
        "cancelled": [],
    }

    if new_status not in allowed_transitions.get(txn.status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition transaction from '{txn.status}' to '{new_status}'."
        )

    txn.status = new_status
    if new_status == "completed":
        txn.completion_confirmed_by_requester = True
        txn.completion_confirmed_by_provider = True
        txn.completed_at = datetime.now(timezone.utc)
        if txn.request_id:
            db.query(Request).filter(Request.id == txn.request_id).update({"status": "completed"})

    db.commit()
    db.refresh(txn)
    return txn


@router.post("/{transaction_id}/confirm-completion", response_model=TransactionOut)
def confirm_completion(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if txn.status == "completed":
        return txn

    if txn.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot complete a cancelled interaction."
        )

    if current_user.id == txn.requester_or_buyer_id:
        txn.completion_confirmed_by_requester = True
    elif current_user.id == txn.provider_or_owner_id:
        txn.completion_confirmed_by_provider = True
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only transaction participants can confirm completion"
        )

    # If both sides have confirmed, mark completed atomically
    if txn.completion_confirmed_by_requester and txn.completion_confirmed_by_provider:
        txn.status = "completed"
        txn.completed_at = datetime.now(timezone.utc)
        if txn.request_id:
            db.query(Request).filter(Request.id == txn.request_id).update({"status": "completed"})

    db.commit()
    db.refresh(txn)
    return txn


@router.post("/{transaction_id}/cancel", response_model=TransactionOut)
def cancel_transaction(
    transaction_id: str,
    cancel_in: TransactionCancel,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if current_user.id not in [txn.requester_or_buyer_id, txn.provider_or_owner_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only transaction participants can cancel this interaction"
        )

    if txn.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed interactions cannot be cancelled."
        )

    if txn.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This interaction is already cancelled."
        )

    txn.status = "cancelled"
    txn.cancellation_reason = cancel_in.reason
    txn.cancelled_by_id = current_user.id

    # If linked to a request, reset request to open and clear assignment
    if txn.request_id:
        req = db.query(Request).filter(Request.id == txn.request_id).first()
        if req and req.status == "assigned":
            req.status = "open"
            req.assigned_provider_id = None
            req.accepted_offer_id = None

    if txn.offer_id:
        offer = db.query(Offer).filter(Offer.id == txn.offer_id).first()
        if offer:
            offer.status = "cancelled"

    db.commit()
    db.refresh(txn)
    return txn


@router.post("/{transaction_id}/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    transaction_id: str,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if txn.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviews can only be submitted after the transaction is fully completed"
        )

    if current_user.id == txn.requester_or_buyer_id:
        reviewee_id = txn.provider_or_owner_id
    elif current_user.id == txn.provider_or_owner_id:
        reviewee_id = txn.requester_or_buyer_id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only transaction participants can submit reviews"
        )

    # Check for duplicate review
    existing_review = db.query(Review).filter(
        Review.transaction_id == transaction_id,
        Review.reviewer_id == current_user.id
    ).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this transaction"
        )

    review = Review(
        transaction_id=transaction_id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=review_in.rating,
        comment=review_in.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
