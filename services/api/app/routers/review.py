"""复习调度接口。"""

from fastapi import APIRouter

from app.services import tutor
from packages.contracts.models import ReviewItem, ReviewNextRequest

router = APIRouter(prefix="/api/v1/review", tags=["review"])


@router.post("/next", response_model=ReviewItem, summary="Get next review item")
def next_review(payload: ReviewNextRequest) -> ReviewItem:
    return tutor.review_next(payload.student_id, payload.subject)
