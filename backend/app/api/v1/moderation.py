from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.core.deps import get_db, get_current_user
from backend.app.models.moderation import Report
from backend.app.models.user import User
from backend.app.schemas.explore import ReportCreate, ReportOut

router = APIRouter(prefix="/reports", tags=["Moderation & Safety"])


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def submit_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = Report(
        reporter_id=current_user.id,
        target_type=report_in.target_type,
        target_id=report_in.target_id,
        reason=report_in.reason,
        details=report_in.details,
        status="open",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
