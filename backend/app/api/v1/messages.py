import html
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from backend.app.core.deps import get_db, get_current_user
from backend.app.core.rate_limit import check_rate_limit
from backend.app.models.message import Message
from backend.app.models.user import User
from backend.app.schemas.message import MessageCreate, MessageOut

router = APIRouter(prefix="/messages", tags=["Messages & Contact Inquiries"])


@router.post("", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def send_message(
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_rate_limit(f"msg_{current_user.id}", max_requests=30, window_seconds=60)

    if current_user.id == msg_in.recipient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot message yourself.",
        )

    recipient = db.query(User).filter(User.id == msg_in.recipient_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found.",
        )

    # Sanitize content
    sanitized_content = html.escape(html.unescape(msg_in.content.strip()))

    message = Message(
        sender_id=current_user.id,
        recipient_id=msg_in.recipient_id,
        related_type=msg_in.related_type,
        related_id=msg_in.related_id,
        content=sanitized_content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("", response_model=list[MessageOut])
def get_messages(
    related_id: str = Query(...),
    related_type: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Message).filter(Message.related_id == related_id)
    if related_type:
        query = query.filter(Message.related_type == related_type)

    # Filter to messages where current user is sender or recipient
    query = query.filter(
        or_(
            Message.sender_id == current_user.id,
            Message.recipient_id == current_user.id,
        )
    ).order_by(Message.created_at.asc())

    return query.all()
