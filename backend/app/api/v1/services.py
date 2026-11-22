from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.core.deps import get_db, get_current_user, get_optional_current_user
from backend.app.models.service import Service
from backend.app.models.moderation import Block
from backend.app.models.user import User
from backend.app.schemas.service import ServiceCreate, ServiceUpdate, ServiceOut

router = APIRouter(prefix="/services", tags=["Student Services"])


@router.get("", response_model=list[ServiceOut])
def list_services(
    category: Optional[str] = None,
    pricing_type: Optional[str] = None,
    q: Optional[str] = None,
    status_filter: Optional[str] = Query("active", alias="status"),
    campus_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    query = db.query(Service)

    if current_user and not campus_id:
        query = query.filter(Service.campus_id == current_user.campus_id)
    elif campus_id:
        query = query.filter(Service.campus_id == campus_id)

    if current_user:
        blocked_ids = [
            b.blocked_id for b in db.query(Block.blocked_id).filter(Block.blocker_id == current_user.id).all()
        ]
        if blocked_ids:
            query = query.filter(~Service.provider_id.in_(blocked_ids))

    if status_filter and status_filter != "all":
        query = query.filter(Service.status == status_filter)

    if category and category.lower() != "all":
        query = query.filter(Service.category.ilike(category))

    if pricing_type and pricing_type.lower() != "all":
        query = query.filter(Service.pricing_type == pricing_type)

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Service.title.ilike(search),
                Service.description.ilike(search),
                Service.category.ilike(search),
                Service.tags.ilike(search),
            )
        )

    return query.order_by(Service.created_at.desc()).all()


@router.post("", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(
    service_in: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = Service(
        provider_id=current_user.id,
        campus_id=current_user.campus_id,
        title=service_in.title,
        description=service_in.description,
        category=service_in.category,
        tags=service_in.tags,
        pricing_type=service_in.pricing_type,
        price=service_in.price,
        availability_note=service_in.availability_note,
        status="active",
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: str, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service


@router.patch("/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: str,
    service_update: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    if service.provider_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this service")

    update_data = service_update.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(service, k, v)

    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=status.HTTP_200_OK)
def archive_service(
    service_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    if service.provider_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this service")

    service.status = "archived"
    db.commit()
    return {"message": "Service archived successfully"}
