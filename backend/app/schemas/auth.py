from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str | None = None
    exp: int | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(min_length=2, max_length=100)
    campus_id: str
    department: str | None = None
    course: str | None = None
    year_or_semester: str | None = None
    bio: str | None = None
    phone: str | None = None
    show_phone: bool = False
    whatsapp: str | None = None
    show_whatsapp: bool = False


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=6)
    reset_code: str = Field(min_length=4)
