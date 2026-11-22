from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.user import UserPublicOut
from backend.app.schemas.offer import OfferOut


class RequestBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    category: str
    request_type: str = Field(pattern="^(item|academic_help|task|campus_help|other)$")
    budget: float | None = Field(default=None, ge=0)
    preferred_arrangement: str = Field(default="any", pattern="^(free|paid|exchange|any)$")
    deadline: str | None = None


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    request_type: str | None = None
    budget: float | None = Field(default=None, ge=0)
    preferred_arrangement: str | None = None
    deadline: str | None = None
    status: str | None = None


class RequestOut(RequestBase):
    id: str
    requester_id: str
    campus_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    requester: UserPublicOut | None = None
    offers_count: int = 0
    offers: list[OfferOut] = []

    model_config = ConfigDict(from_attributes=True)
