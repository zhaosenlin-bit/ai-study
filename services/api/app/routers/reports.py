"""家长报告接口。"""

from fastapi import APIRouter

from app.services import tutor
from packages.contracts.models import ParentReport

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


@router.get("/parent/{student_id}", response_model=ParentReport, summary="Get parent report")
def parent_report(student_id: str) -> ParentReport:
    return tutor.parent_report(student_id)
