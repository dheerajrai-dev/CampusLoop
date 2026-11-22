from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.user import UserPublicOut


class ListingImageOut(BaseModel):
    id: str
    image_url: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ListingBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    category: str
    listing_mode: str = Field(pattern="^(sell|lend|giveaway|exchange)$")
    price: float | None = Field(default=None, ge=0)
    condition: str | None = None
    pickup_area: str = Field(min_length=2, max_length=200)


class ListingCreate(ListingBase):
    image_urls: list[str] = []


class ListingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    listing_mode: str | None = None
    price: float | None = Field(default=None, ge=0)
    condition: str | None = None
    pickup_area: str | None = None
    availability_status: str | None = None


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
