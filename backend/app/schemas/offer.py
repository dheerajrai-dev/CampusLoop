from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
import html
from backend.app.schemas.user import UserPublicOut


def sanitize_text(v: str | None) -> str | None:
    if v is None:
        return None
    raw = html.unescape(v.strip())
    return html.escape(raw)


class OfferBase(BaseModel):
    message: str = Field(min_length=3, max_length=2000)
    proposed_price: float | None = Field(default=None, ge=0, le=100000)
    availability_note: str | None = Field(default=None, max_length=255)

    @field_validator("message", "availability_note", mode="before")
    def sanitize_inputs(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class OfferCreate(OfferBase):
    pass


class OfferUpdate(BaseModel):
    message: str | None = Field(default=None, min_length=3, max_length=2000)
    proposed_price: float | None = Field(default=None, ge=0, le=100000)
    availability_note: str | None = Field(default=None, max_length=255)
    status: str | None = None

    @field_validator("message", "availability_note", mode="before")
    def sanitize_inputs(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class OfferOut(OfferBase):
    id: str
    request_id: str
    provider_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    provider: UserPublicOut | None = None

    model_config = ConfigDict(from_attributes=True)
