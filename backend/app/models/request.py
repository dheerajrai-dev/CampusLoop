import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class Request(Base):
    __tablename__ = "requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    campus_id: Mapped[str] = mapped_column(String(36), ForeignKey("campuses.id"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    request_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # item, academic_help, task, campus_help, other
    budget: Mapped[float | None] = mapped_column(Float, nullable=True)
    preferred_arrangement: Mapped[str] = mapped_column(
        String(50), default="any", nullable=False
    )  # free, paid, exchange, any
    deadline: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="open", index=True, nullable=False
    )  # open, assigned, in_progress, completed, cancelled, archived
    assigned_provider_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True, index=True
    )
    accepted_offer_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("offers.id"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    requester: Mapped["User"] = relationship("User", foreign_keys=[requester_id], back_populates="requests")
    assigned_provider: Mapped["User"] = relationship("User", foreign_keys=[assigned_provider_id])
    offers: Mapped[list["Offer"]] = relationship(
        "Offer", foreign_keys="Offer.request_id", back_populates="request", cascade="all, delete-orphan"
    )


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("requests.id", ondelete="CASCADE"), index=True, nullable=False
    )
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    proposed_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    availability_note: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", index=True, nullable=False
    )  # pending, accepted, rejected, withdrawn, completed, cancelled
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    request: Mapped["Request"] = relationship("Request", foreign_keys=[request_id], back_populates="offers")
    provider: Mapped["User"] = relationship("User", foreign_keys=[provider_id], back_populates="offers")


from backend.app.models.user import User  # noqa: E402
