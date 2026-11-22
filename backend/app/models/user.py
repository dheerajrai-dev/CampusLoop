import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    campus_id: Mapped[str] = mapped_column(String(36), ForeignKey("campuses.id"), index=True, nullable=False)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    course: Mapped[str | None] = mapped_column(String(100), nullable=True)
    year_or_semester: Mapped[str | None] = mapped_column(String(50), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Voluntary contact preferences
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    show_phone: Mapped[bool] = mapped_column(Boolean, default=False)
    whatsapp: Mapped[str | None] = mapped_column(String(30), nullable=True)
    show_whatsapp: Mapped[bool] = mapped_column(Boolean, default=False)
    contact_note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    campus: Mapped["Campus"] = relationship("Campus", back_populates="users")
    listings: Mapped[list["Listing"]] = relationship("Listing", back_populates="owner")
    requests: Mapped[list["Request"]] = relationship(
        "Request", foreign_keys="Request.requester_id", back_populates="requester"
    )
    offers: Mapped[list["Offer"]] = relationship(
        "Offer", foreign_keys="Offer.provider_id", back_populates="provider"
    )
    services: Mapped[list["Service"]] = relationship("Service", back_populates="provider")


from backend.app.models.campus import Campus  # noqa: E402
from backend.app.models.listing import Listing  # noqa: E402
from backend.app.models.request import Request, Offer  # noqa: E402
from backend.app.models.service import Service  # noqa: E402
