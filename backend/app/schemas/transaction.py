from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.user import UserPublicOut


class ReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewCreate(ReviewBase):
    pass


class ReviewOut(ReviewBase):
    id: str
    transaction_id: str
    reviewer_id: str
    reviewee_id: str
    created_at: datetime
    reviewer: UserPublicOut | None = None

    model_config = ConfigDict(from_attributes=True)


class TransactionStatusUpdate(BaseModel):
    status: str = Field(pattern="^(accepted|in_progress|completed|cancelled)$")


class TransactionCancel(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500)


class TransactionOut(BaseModel):
    id: str
    request_id: str | None = None
    listing_id: str | None = None
    service_id: str | None = None
    offer_id: str | None = None
    requester_or_buyer_id: str
    provider_or_owner_id: str
    status: str
    completion_confirmed_by_requester: bool
    completion_confirmed_by_provider: bool
    cancellation_reason: str | None = None
    cancelled_by_id: str | None = None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None
    requester_or_buyer: UserPublicOut | None = None
    provider_or_owner: UserPublicOut | None = None
    reviews: list[ReviewOut] = []

    model_config = ConfigDict(from_attributes=True)
