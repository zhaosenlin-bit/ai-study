"""/me 端点：当前登录用户 + 绑定的学生资料。"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app import 数据库

router = APIRouter(prefix="/api/v1/me", tags=["me"])


class MeResponse(BaseModel):
    user_id: str
    username: str
    role: str
    display_name: str
    student: dict


class GradeUpdateRequest(BaseModel):
    grade: int


def _build_me(user: dict) -> MeResponse:
    student = 数据库.get_or_create_student(user["user_id"])
    return MeResponse(
        user_id=user["user_id"],
        username=user["username"],
        role=user["role"],
        display_name=user.get("display_name") or user["username"],
        student=student,
    )


@router.get("", response_model=MeResponse, summary="当前用户 + 绑定的学生")
def get_me(user_id: str) -> MeResponse:
    user = _get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"code": "user_not_found", "message": "用户不存在"})
    return _build_me(user)


@router.put("/grade", response_model=MeResponse, summary="设置当前学生年级")
def set_grade(user_id: str, payload: GradeUpdateRequest) -> MeResponse:
    if payload.grade not in (3, 4, 5, 6):
        raise HTTPException(status_code=400, detail={"code": "grade_invalid", "message": "年级仅支持 3/4/5/6"})
    user = _get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"code": "user_not_found", "message": "用户不存在"})
    student = 数据库.get_or_create_student(user_id)
    student["grade"] = payload.grade
    student["name"] = user.get("display_name") or user["username"]
    数据库.upsert_student(student)
    return _build_me(user)


# ---- 辅助：通过 user_id 查 user ----

def _get_user_by_id(user_id: str) -> dict | None:
    from app.数据库 import _connect
    with _connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
    if not row:
        return None
    return {
        "user_id": row["user_id"],
        "username": row["username"],
        "password_hash": row["password_hash"],
        "role": row["role"],
        "display_name": row["display_name"],
        "linked_student_id": row["linked_student_id"],
        "created_at": row["created_at"],
    }