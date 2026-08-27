"""学习时长：记录答题/学习时长，家长端查询汇总。"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app import 数据库

router = APIRouter(prefix="/api/v1/study", tags=["study"])


class StudyTimeRecord(BaseModel):
    student_id: str
    subject: str = Field(pattern="^(math|chinese|english)$")
    seconds: int = Field(ge=1, le=86400)


@router.post("/time", summary="记录学习时长（秒）")
def record_time(payload: StudyTimeRecord) -> dict:
    数据库.add_study_time(payload.student_id, payload.subject, payload.seconds)
    return {"recorded": True, "seconds": payload.seconds}


@router.get("/time", summary="近 N 天学习时长汇总（秒）")
def study_time(student_id: str, days: int = 7) -> dict:
    return 数据库.get_study_time(student_id, days)