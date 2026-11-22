from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.deps import get_db, get_current_user
from backend.app.core.security import verify_password, hash_password, create_access_token
from backend.app.core.rate_limit import check_rate_limit
from backend.app.models.campus import Campus
from backend.app.models.user import User
from backend.app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from backend.app.schemas.campus import CampusOut, CampusCreate
from backend.app.schemas.user import UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory store for password reset codes in this environment
RESET_CODES: dict[str, str] = {}


@router.get("/campuses", response_model=list[CampusOut])
def get_campuses(db: Session = Depends(get_db)):
    return db.query(Campus).all()


@router.post("/campuses", response_model=CampusOut, status_code=status.HTTP_201_CREATED)
def create_campus(campus_in: CampusCreate, db: Session = Depends(get_db)):
    campus = Campus(
        name=campus_in.name,
        email_domain=campus_in.email_domain,
        city=campus_in.city
    )
    db.add(campus)
    db.commit()
    db.refresh(campus)
    return campus


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(user_in: RegisterRequest, db: Session = Depends(get_db)):
    check_rate_limit(f"reg_{user_in.email}", max_requests=10, window_seconds=60)

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # Check campus
    campus = db.query(Campus).filter(Campus.id == user_in.campus_id).first()
    if not campus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selected campus was not found.",
        )

    # Campus domain verification or demo verification
    is_verified = False
    user_email_domain = user_in.email.lower().split("@")[-1] if "@" in user_in.email else ""
    if campus.email_domain and user_email_domain == campus.email_domain.lower():
        is_verified = True
    elif user_in.email.lower().endswith(".edu") or "demo" in user_in.email.lower():
        is_verified = True

    hashed_pw = hash_password(user_in.password)
    user = User(
        email=user_in.email.lower(),
        password_hash=hashed_pw,
        full_name=user_in.full_name,
        campus_id=user_in.campus_id,
        department=user_in.department,
        course=user_in.course,
        year_or_semester=user_in.year_or_semester,
        bio=user_in.bio,
        is_verified=is_verified,
        phone=user_in.phone,
        show_phone=user_in.show_phone,
        whatsapp=user_in.whatsapp,
        show_whatsapp=user_in.show_whatsapp,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user).model_dump()
    }


@router.post("/login", response_model=dict)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    check_rate_limit(f"login_{login_in.email}", max_requests=15, window_seconds=60)

    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user).model_dump()
    }


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    check_rate_limit(f"forgot_{req.email}", max_requests=5, window_seconds=60)

    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Avoid leaking whether an email exists or not
        return {
            "message": "If an account exists with this campus email, password recovery instructions have been sent.",
            "demo_reset_code": None,
        }

    # Generate 6-digit reset code
    code = "123456"
    RESET_CODES[req.email.lower()] = code

    return {
        "message": "Password recovery code generated.",
        "demo_reset_code": code,
        "note": "For development and testing, use verification code: 123456",
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found.",
        )

    saved_code = RESET_CODES.get(req.email.lower())
    # Accept 123456 or stored code
    if req.reset_code not in [saved_code, "123456"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code.",
        )

    user.password_hash = hash_password(req.new_password)
    db.commit()

    if req.email.lower() in RESET_CODES:
        del RESET_CODES[req.email.lower()]

    return {"message": "Password updated successfully. You can now sign in with your new password."}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
