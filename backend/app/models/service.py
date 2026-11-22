import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    campus_id: Mapped[str] = mapped_column(String(36), ForeignKey("campuses.id"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    tags: Mapped[str | None] = mapped_column(Text, nullable=True)  # Comma-separated or JSON list
    pricing_type: Mapped[str] = mapped_column(
        String(50), default="negotiable", nullable=False
    )  # free, fixed, hourly, negotiable
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    availability_note: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="active", index=True, nullable=False
    )  # active, paused, archived
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    provider: Mapped["User"] = relationship("User", back_populates="services")


from backend.app.models.user import User  # noqa: E402
