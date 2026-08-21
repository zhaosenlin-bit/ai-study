"""学生接口：画像、学习路径、错题本。"""

from fastapi import APIRouter

from app.services import tutor
from packages.contracts.models import LearningPath, MistakeRecord, StudentProfile

router = APIRouter(prefix="/api/v1/students", tags=["students"])


@router.get("/{student_id}/profile", response_model=StudentProfile, summary="Get student profile")
def get_profile(student_id: str) -> StudentProfile:
    return tutor.get_profile(student_id)


@router.get("/{student_id}/path", response_model=LearningPath, summary="Get current learning path")
def get_path(student_id: str) -> LearningPath:
    return tutor.get_path(student_id)


@router.get(
    "/{student_id}/mistakes",
    response_model=list[MistakeRecord],
    summary="Get mistake book",
)
def get_mistakes(student_id: str) -> list[MistakeRecord]:
    return tutor.get_mistakes(student_id)
