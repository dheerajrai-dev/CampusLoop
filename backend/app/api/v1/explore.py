from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.core.deps import get_db, get_optional_current_user
from backend.app.models.request import Request
from backend.app.models.listing import Listing
from backend.app.models.service import Service
from backend.app.models.moderation import Block
from backend.app.models.user import User
from backend.app.schemas.explore import ExploreItem
from backend.app.schemas.user import UserPublicOut

router = APIRouter(prefix="/explore", tags=["Campus Explore Feed"])


@router.get("", response_model=list[ExploreItem])
def get_explore_feed(
    item_type: Optional[str] = Query("all", alias="type"),  # request, listing, service, all
    category: Optional[str] = None,
    q: Optional[str] = None,
    campus_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    target_campus = campus_id or (current_user.campus_id if current_user else None)
    blocked_ids = []
    if current_user:
        blocked_ids = [
            b.blocked_id for b in db.query(Block.blocked_id).filter(Block.blocker_id == current_user.id).all()
        ]

    feed_items: list[ExploreItem] = []

    # 1. Fetch Requests
    if item_type in ["all", "request", "requests"]:
        req_query = db.query(Request).filter(Request.status == "open")
        if target_campus:
            req_query = req_query.filter(Request.campus_id == target_campus)
        if blocked_ids:
            req_query = req_query.filter(~Request.requester_id.in_(blocked_ids))
        if category and category.lower() != "all":
            req_query = req_query.filter(Request.category.ilike(category))
        if q:
            search = f"%{q}%"
            req_query = req_query.filter(
                or_(
                    Request.title.ilike(search),
                    Request.description.ilike(search),
                    Request.category.ilike(search),
                )
            )
        
        for req in req_query.order_by(Request.created_at.desc()).limit(30).all():
            badge_label = "Request"
            badge_variant = "free"
            if req.preferred_arrangement == "paid":
                badge_label = f"₹{req.budget or 'Negotiable'}"
                badge_variant = "paid"
            elif req.preferred_arrangement == "exchange":
                badge_label = "Exchange"
                badge_variant = "exchange"
            elif req.preferred_arrangement == "free":
                badge_label = "Free / Peer Help"
                badge_variant = "free"

            feed_items.append(
                ExploreItem(
                    id=req.id,
                    item_type="request",
                    title=req.title,
                    description=req.description,
                    category=req.category,
                    price_or_budget=req.budget,
                    badge_label=badge_label,
                    badge_variant=badge_variant,
                    status=req.status,
                    created_at=req.created_at,
                    creator=UserPublicOut.model_validate(req.requester) if req.requester else None,
                    extra={
                        "request_type": req.request_type,
                        "preferred_arrangement": req.preferred_arrangement,
                        "deadline": req.deadline,
                        "offers_count": len(req.offers),
                    }
                )
            )

    # 2. Fetch Listings (Marketplace Items)
    if item_type in ["all", "listing", "listings", "item", "items"]:
        list_query = db.query(Listing).filter(Listing.availability_status == "available")
        if target_campus:
            list_query = list_query.filter(Listing.campus_id == target_campus)
        if blocked_ids:
            list_query = list_query.filter(~Listing.owner_id.in_(blocked_ids))
        if category and category.lower() != "all":
            list_query = list_query.filter(Listing.category.ilike(category))
        if q:
            search = f"%{q}%"
            list_query = list_query.filter(
                or_(
                    Listing.title.ilike(search),
                    Listing.description.ilike(search),
                    Listing.category.ilike(search),
                    Listing.pickup_area.ilike(search),
                )
            )

        for item in list_query.order_by(Listing.created_at.desc()).limit(30).all():
            mode_map = {
                "sell": (f"₹{item.price or 0} (Sell)", "paid"),
                "lend": ("Borrow / Lend", "borrow"),
                "giveaway": ("Free Giveaway", "free"),
                "exchange": ("Exchange", "exchange"),
            }
            badge_label, badge_variant = mode_map.get(item.listing_mode, (item.listing_mode.title(), "free"))

            image_url = item.images[0].image_url if item.images else None

            feed_items.append(
                ExploreItem(
                    id=item.id,
                    item_type="listing",
                    title=item.title,
                    description=item.description,
                    category=item.category,
                    price_or_budget=item.price,
                    badge_label=badge_label,
                    badge_variant=badge_variant,
                    status=item.availability_status,
                    created_at=item.created_at,
                    creator=UserPublicOut.model_validate(item.owner) if item.owner else None,
                    extra={
                        "listing_mode": item.listing_mode,
                        "condition": item.condition,
                        "pickup_area": item.pickup_area,
                        "image_url": image_url,
                    }
                )
            )

    # 3. Fetch Services
    if item_type in ["all", "service", "services"]:
        srv_query = db.query(Service).filter(Service.status == "active")
        if target_campus:
            srv_query = srv_query.filter(Service.campus_id == target_campus)
        if blocked_ids:
            srv_query = srv_query.filter(~Service.provider_id.in_(blocked_ids))
        if category and category.lower() != "all":
            srv_query = srv_query.filter(Service.category.ilike(category))
        if q:
            search = f"%{q}%"
            srv_query = srv_query.filter(
                or_(
                    Service.title.ilike(search),
                    Service.description.ilike(search),
                    Service.category.ilike(search),
                    Service.tags.ilike(search),
                )
            )

        for srv in srv_query.order_by(Service.created_at.desc()).limit(30).all():
            badge_label = "Service"
            badge_variant = "paid"
            if srv.pricing_type == "free":
                badge_label = "Free Help"
                badge_variant = "free"
            elif srv.pricing_type == "hourly":
                badge_label = f"₹{srv.price or 0}/hr"
            elif srv.pricing_type == "fixed":
                badge_label = f"₹{srv.price or 0} Fixed"
            else:
                badge_label = "Negotiable"

            feed_items.append(
                ExploreItem(
                    id=srv.id,
                    item_type="service",
                    title=srv.title,
                    description=srv.description,
                    category=srv.category,
                    price_or_budget=srv.price,
                    badge_label=badge_label,
                    badge_variant=badge_variant,
                    status=srv.status,
                    created_at=srv.created_at,
                    creator=UserPublicOut.model_validate(srv.provider) if srv.provider else None,
                    extra={
                        "pricing_type": srv.pricing_type,
                        "tags": srv.tags,
                        "availability_note": srv.availability_note,
                    }
                )
            )

    # Sort combined feed items by newest first
    feed_items.sort(key=lambda x: x.created_at, reverse=True)
    return feed_items
