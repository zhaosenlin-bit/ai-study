"""AI 智能改卷：拍照练习 → 保存图片 → AI 批改反馈 → 长期记忆。

- 图片保存到 服务/api/data/practice/{student_id}/
- AI 反馈：真实模型（spark/deepseek/minimax 等）时生成个性化讲解；
  mock 模式返回按对错/科目生成的标准鼓励与建议
- 判题：MVP 由学生自评对错（self_correct），后续接入视觉模型自动识别
- 记录双写：数据库 practice_records（事实）+ 知识库 memories（认知）
"""

import os
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app import 数据库
from app.services import 知识库
from 服务.agent.模型网关 import active_provider, complete

router = APIRouter(prefix="/api/v1/practice", tags=["practice"])

PRACTICE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "practice")

SUBJECT_LABEL = {"math": "数学", "chinese": "语文", "english": "英语"}


def _ai_mark(subject: str, note: str, self_correct: bool) -> str:
    """生成批改反馈。"""
    if active_provider() == "mock":
        good = "做得很认真！继续保持这个状态，每天进步一点点。"
        bad = "没关系，错题是最好的老师！建议把这道题抄进错题本，明天再复习一次。"
        return good if self_correct else bad
    try:
        system = "你是小学助教老师。学生拍了练习照片并告诉你题目内容和自己的判断，请用2句话点评并给出改进建议，语气亲切。"
        user = (
            f"学科：{SUBJECT_LABEL.get(subject, subject)}\n"
            f"题目内容：{note or '（未填写）'}\n"
            f"学生自评：{'做对了' if self_correct else '做错了'}\n"
            "请点评并给建议。"
        )
        text, _ = complete(system, user)
        return text.strip()[:200]
    except Exception:
        return "已记录，加油！"


@router.post("/upload", summary="拍照改卷：上传图片 + AI 批改 + 入库")
async def upload_practice(
    student_id: str = Form(...),
    subject: str = Form("math"),
    note: str = Form(""),
    self_correct: bool = Form(True),
    file: UploadFile = File(...),
) -> dict:
    if subject not in SUBJECT_LABEL:
        raise HTTPException(status_code=400, detail={"code": "subject_invalid", "message": "学科仅支持 math/chinese/english"})

    # 保存图片
    ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    user_dir = os.path.join(PRACTICE_DIR, student_id)
    os.makedirs(user_dir, exist_ok=True)
    fname = f"{uuid4().hex[:10]}{ext}"
    fpath = os.path.join(user_dir, fname)
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail={"code": "too_large", "message": "图片不能超过 10MB"})
    with open(fpath, "wb") as fh:
        fh.write(data)

    feedback = _ai_mark(subject, note, self_correct)
    record = {
        "practice_id": uuid4().hex[:16],
        "student_id": student_id,
        "subject": subject,
        "image_path": f"/data/practice/{student_id}/{fname}",
        "note": note,
        "self_correct": 1 if self_correct else 0,
        "ai_feedback": feedback,
    }
    数据库.save_practice(record)

    # 写入长期记忆知识库（认知层）
    知识库.remember(
        student_id, "image",
        f"拍照练习（{SUBJECT_LABEL[subject]}）：{note or '练习题'}，自评{'正确' if self_correct else '错误'}，AI反馈：{feedback}",
        {"subject": subject, "self_correct": self_correct, "practice_id": record["practice_id"]},
    )

    return {"practice_id": record["practice_id"], "subject": subject, "ai_feedback": feedback, "image_path": record["image_path"]}


@router.get("/list", summary="拍照改卷记录")
def list_practices(student_id: str) -> list[dict]:
    return 数据库.list_practices(student_id)
