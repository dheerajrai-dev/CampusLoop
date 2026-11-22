import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("requests.id"), nullable=True, index=True)
    listing_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("listings.id"), nullable=True, index=True)
    service_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("services.id"), nullable=True, index=True)
    offer_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("offers.id"), nullable=True, index=True)
    requester_or_buyer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True, nullable=False
    )
    provider_or_owner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50), default="accepted", index=True, nullable=False
    )  # accepted, in_progress, completed, cancelled
    completion_confirmed_by_requester: Mapped[bool] = mapped_column(Boolean, default=False)
    completion_confirmed_by_provider: Mapped[bool] = mapped_column(Boolean, default=False)
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancelled_by_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    requester_or_buyer: Mapped["User"] = relationship("User", foreign_keys=[requester_or_buyer_id])
    provider_or_owner: Mapped["User"] = relationship("User", foreign_keys=[provider_or_owner_id])
    request: Mapped["Request"] = relationship("Request", foreign_keys=[request_id])
    offer: Mapped["Offer"] = relationship("Offer", foreign_keys=[offer_id])
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="transaction")


from backend.app.models.user import User  # noqa: E402
from backend.app.models.request import Request, Offer  # noqa: E402
from backend.app.models.review import Review  # noqa: E402
