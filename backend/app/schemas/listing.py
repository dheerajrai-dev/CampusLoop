from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
import html
from backend.app.schemas.user import UserPublicOut


def sanitize_text(v: str | None) -> str | None:
    if v is None:
        return None
    raw = html.unescape(v.strip())
    return html.escape(raw)


class ListingImageOut(BaseModel):
    id: str
    image_url: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ListingBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5, max_length=5000)
    category: str = Field(min_length=2, max_length=100)
    listing_mode: str = Field(pattern="^(sell|lend|giveaway|exchange)$")
    price: float | None = Field(default=None, ge=0, le=100000)
    condition: str | None = Field(default=None, max_length=50)
    pickup_area: str = Field(min_length=2, max_length=200)

    @field_validator("title", "description", "category", "condition", "pickup_area", mode="before")
    def sanitize_inputs(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class ListingCreate(ListingBase):
    image_urls: list[str] = []


class ListingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=5, max_length=5000)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    listing_mode: str | None = None
    price: float | None = Field(default=None, ge=0, le=100000)
    condition: str | None = Field(default=None, max_length=50)
    pickup_area: str | None = Field(default=None, min_length=2, max_length=200)
    availability_status: str | None = None

    @field_validator("title", "description", "category", "condition", "pickup_area", mode="before")
    def sanitize_inputs(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class ListingInquiry(BaseModel):
    message: str = Field(min_length=3, max_length=1000)
    proposed_meeting_spot: str | None = Field(default=None, max_length=200)

    @field_validator("message", "proposed_meeting_spot", mode="before")
    def sanitize_inputs(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class ListingOut(ListingBase):
    id: str
    owner_id: str
    campus_id: str
    availability_status: str
    created_at: datetime
    updated_at: datetime
    owner: UserPublicOut | None = None
    images: list[ListingImageOut] = []

    model_config = ConfigDict(from_attributes=True)
