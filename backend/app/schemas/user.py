from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, model_validator
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
    phone: str | None = None
    show_phone: bool = False
    whatsapp: str | None = None
    show_whatsapp: bool = False
    contact_note: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    department: str | None = None
    course: str | None = None
    year_or_semester: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    phone: str | None = None
    show_phone: bool | None = None
    whatsapp: str | None = None
    show_whatsapp: bool | None = None
    contact_note: str | None = None


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
    phone: str | None = None
    whatsapp: str | None = None
    contact_note: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="wrap")
    @classmethod
    def filter_private_contact(cls, data, handler):
        # If passed an ORM model object
        if hasattr(data, "show_phone") and not data.show_phone:
            # We can construct dict and clear phone
            res = handler(data)
            res.phone = None
            if hasattr(data, "show_whatsapp") and not data.show_whatsapp:
                res.whatsapp = None
            return res
        return handler(data)
