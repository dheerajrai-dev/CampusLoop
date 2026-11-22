from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CampusBase(BaseModel):
    name: str
    email_domain: str | None = None
    city: str | None = None


class CampusCreate(CampusBase):
    pass


class CampusOut(CampusBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
