"""学生接口：画像、学习路径、错题本。"""

from fastapi import APIRouter

from app.services import 伴学服务
from 包.contracts.模型 import LearningPath, MistakeRecord, StudentProfile

router = APIRouter(prefix="/api/v1/students", tags=["students"])


@router.get("/{student_id}/profile", response_model=StudentProfile, summary="Get student profile")
def get_profile(student_id: str) -> StudentProfile:
    return 伴学服务.get_profile(student_id)


@router.get("/{student_id}/path", response_model=LearningPath, summary="Get current learning path")
def get_path(student_id: str) -> LearningPath:
    return 伴学服务.get_path(student_id)


@router.get(
    "/{student_id}/mistakes",
    response_model=list[MistakeRecord],
    summary="Get mistake book",
)
def get_mistakes(student_id: str) -> list[MistakeRecord]:
    return 伴学服务.get_mistakes(student_id)