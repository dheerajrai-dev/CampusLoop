from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.user import UserPublicOut


class OfferBase(BaseModel):
    message: str = Field(min_length=3)
    proposed_price: float | None = Field(default=None, ge=0)
    availability_note: str | None = None


class OfferCreate(OfferBase):
    pass


class OfferUpdate(BaseModel):
    message: str | None = None
    proposed_price: float | None = Field(default=None, ge=0)
    availability_note: str | None = None
    status: str | None = None  # withdrawn, etc.


class OfferOut(OfferBase):
    id: str
    request_id: str
    provider_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    provider: UserPublicOut | None = None

    model_config = ConfigDict(from_attributes=True)
