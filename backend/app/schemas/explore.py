from datetime import datetime
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.user import UserPublicOut


class ExploreItem(BaseModel):
    id: str
    item_type: str  # "request", "listing", "service"
    title: str
    description: str
    category: str
    price_or_budget: float | None = None
    badge_label: str  # "Free", "Borrow", "Exchange", "Sell", "Giveaway", "Paid", "Hourly"
    badge_variant: str  # "free", "borrow", "exchange", "paid"
    status: str
    created_at: datetime
    creator: UserPublicOut | None = None
    extra: dict = {}

    model_config = ConfigDict(from_attributes=True)


class ReportCreate(BaseModel):
    target_type: str  # user, listing, request, service, offer
    target_id: str
    reason: str
    details: str | None = None


class ReportOut(ReportCreate):
    id: str
    reporter_id: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
