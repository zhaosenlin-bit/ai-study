"""学生接口：画像、学习路径、错题本。"""

from fastapi import APIRouter

from app import 数据库
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

# ============ AI 伴学画像（长期记忆，第一步） ============

from pydantic import BaseModel


class ProfileAnswer(BaseModel):
    """画像问卷单条回答：环节 key + 答案。"""
    key: str  # study_time / study_period / interests / goals / study_style / talk
    value: str


class ProfileSubmitRequest(BaseModel):
    student_id: str
    answers: list[ProfileAnswer]


@router.get("/{student_id}/ai-profile", summary="读取 AI 伴学画像（长期记忆）")
def get_ai_profile(student_id: str) -> dict:
    return 数据库.get_student_profile(student_id)


@router.post("/ai-profile", summary="保存 AI 伴学画像（问卷+谈心记录）")
def save_ai_profile(payload: ProfileSubmitRequest) -> dict:
    profile = 数据库.get_student_profile(payload.student_id)
    for ans in payload.answers:
        profile[ans.key] = ans.value
    数据库.save_student_profile(payload.student_id, profile)
    return profile
