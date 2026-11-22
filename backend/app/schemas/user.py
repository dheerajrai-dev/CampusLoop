from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from backend.app.schemas.campus import CampusOut


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    department: str | None = None
    course: str | None = None
    year_or_semester: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    is_verified: bool = False


class UserUpdate(BaseModel):
    full_name: str | None = None
    department: str | None = None
    course: str | None = None
    year_or_semester: str | None = None
    avatar_url: str | None = None
    bio: str | None = None


class UserOut(UserBase):
    id: str
    campus_id: str
    campus: CampusOut | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserPublicOut(BaseModel):
    id: str
    full_name: str
    campus_id: str
    department: str | None = None
    course: str | None = None
    year_or_semester: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    is_verified: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
