from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
import html
from backend.app.schemas.user import UserPublicOut


def sanitize_text(v: str | None) -> str | None:
    if v is None:
        return None
    raw = html.unescape(v.strip())
    return html.escape(raw)


class ServiceBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5, max_length=5000)
    category: str = Field(min_length=2, max_length=100)
    tags: str | None = Field(default=None, max_length=300)
    pricing_type: str = Field(default="negotiable", pattern="^(free|fixed|hourly|negotiable)$")
    price: float | None = Field(default=None, ge=0, le=100000)
    availability_note: str | None = Field(default=None, max_length=255)

    @field_validator("title", "description", "category", "tags", "availability_note", mode="before")
    def sanitize_inputs(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=5, max_length=5000)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    tags: str | None = Field(default=None, max_length=300)
    pricing_type: str | None = None
    price: float | None = Field(default=None, ge=0, le=100000)
    availability_note: str | None = Field(default=None, max_length=255)
    status: str | None = None

    @field_validator("title", "description", "category", "tags", "availability_note", mode="before")
    def sanitize_inputs(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class ServiceBooking(BaseModel):
    message: str = Field(min_length=3, max_length=1000)
    desired_timeline: str | None = Field(default=None, max_length=200)

    @field_validator("message", "desired_timeline", mode="before")
    def sanitize_inputs(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class ServiceOut(ServiceBase):
    id: str
    provider_id: str
    campus_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    provider: UserPublicOut | None = None

    model_config = ConfigDict(from_attributes=True)
