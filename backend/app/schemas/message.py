from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from backend.app.schemas.user import UserPublicOut


class MessageCreate(BaseModel):
    recipient_id: str
    related_type: str = Field(..., pattern="^(request|listing|service|transaction)$")
    related_id: str
    content: str = Field(..., min_length=1, max_length=2000)


class MessageOut(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    related_type: str
    related_id: str
    content: str
    created_at: datetime
    sender: UserPublicOut | None = None
    recipient: UserPublicOut | None = None

    model_config = ConfigDict(from_attributes=True)
