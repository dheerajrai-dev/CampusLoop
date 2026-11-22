from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
import html
from backend.app.schemas.user import UserPublicOut
from backend.app.schemas.offer import OfferOut


def sanitize_text(v: str | None) -> str | None:
    if v is None:
        return None
    # unescape first so it is completely idempotent (prevents double escaping)
    raw = html.unescape(v.strip())
    return html.escape(raw)


class RequestBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5, max_length=5000)
    category: str = Field(min_length=2, max_length=100)
    request_type: str = Field(pattern="^(item|academic_help|task|campus_help|other)$")
    budget: float | None = Field(default=None, ge=0, le=100000)
    preferred_arrangement: str = Field(default="any", pattern="^(free|paid|exchange|any)$")
    deadline: str | None = Field(default=None, max_length=100)

    @field_validator("title", "description", "category", "deadline", mode="before")
    def sanitize_inputs(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=5, max_length=5000)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    request_type: str | None = None
    budget: float | None = Field(default=None, ge=0, le=100000)
    preferred_arrangement: str | None = None
    deadline: str | None = Field(default=None, max_length=100)
    status: str | None = None

    @field_validator("title", "description", "category", "deadline", mode="before")
    def sanitize_inputs(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class RequestOut(RequestBase):
    id: str
    requester_id: str
    campus_id: str
    status: str
    assigned_provider_id: str | None = None
    accepted_offer_id: str | None = None
    created_at: datetime
    updated_at: datetime
    requester: UserPublicOut | None = None
    assigned_provider: UserPublicOut | None = None
    offers_count: int = 0
    offers: list[OfferOut] = []
    match_score: int | None = None
    match_reasons: list[str] = []

    model_config = ConfigDict(from_attributes=True)
