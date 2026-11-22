from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.user import UserPublicOut


class ServiceBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    category: str
    tags: str | None = None
    pricing_type: str = Field(default="negotiable", pattern="^(free|fixed|hourly|negotiable)$")
    price: float | None = Field(default=None, ge=0)
    availability_note: str | None = None


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    tags: str | None = None
    pricing_type: str | None = None
    price: float | None = Field(default=None, ge=0)
    availability_note: str | None = None
    status: str | None = None


class ServiceOut(ServiceBase):
    id: str
    provider_id: str
    campus_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    provider: UserPublicOut | None = None

    model_config = ConfigDict(from_attributes=True)
