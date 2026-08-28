"""诊断接口：开始诊断、提交答案。"""

from fastapi import APIRouter

from app import 数据库
from app.services import 伴学服务, 知识库
from 包.contracts.模型 import (
    DiagnosisResult,
    DiagnosisSession,
    DiagnosisStartRequest,
    DiagnosisSubmitRequest,
)

router = APIRouter(prefix="/api/v1/diagnosis", tags=["diagnosis"])


@router.post("/start", response_model=DiagnosisSession, summary="Start diagnosis session")
def start_diagnosis(payload: DiagnosisStartRequest) -> DiagnosisSession:
    return 伴学服务.start_diagnosis(payload)


@router.post("/submit", response_model=DiagnosisResult, summary="Submit diagnosis answers")
def submit_diagnosis(payload: DiagnosisSubmitRequest) -> DiagnosisResult:
    return 伴学服务.submit_diagnosis(
        payload.session_id, payload.student_id, payload.answers
    )

# ============ 每日诊断（教材驱动，六大题型） ============

from datetime import date as _date, datetime, timedelta

from fastapi import HTTPException
from pydantic import BaseModel, Field

from app.services import 口算生成, 学科出题

CATEGORIES = [
    {"category": "math_oral", "label": "数学口算", "icon": "🧮", "subject": "math", "count": 2},
    {"category": "math_app", "label": "数学应用题", "icon": "🛒", "subject": "math", "count": 2},
    {"category": "chinese_poem", "label": "语文写古诗", "icon": "🖋️", "subject": "chinese", "count": 1},
    {"category": "chinese_reading", "label": "语文阅读题", "icon": "📖", "subject": "chinese", "count": 1},
    {"category": "english_word", "label": "英语看中文选英文", "icon": "🔤", "subject": "english", "count": 2},
    {"category": "english_sentence", "label": "英语连词成句", "icon": "✍️", "subject": "english", "count": 1},
]


def _today_seed(grade: int) -> int:
    """每天一套不同的题：seed = 日期 + 年级。"""
    return grade * 100000 + int(_date.today().strftime("%Y%m%d")) % 1000000


class DailyAnswer(BaseModel):
    category: str
    question_id: str
    answer: str


class DailySubmitRequest(BaseModel):
    student_id: str
    grade: int = Field(ge=3, le=6)
    answers: list[DailyAnswer]


def _build_daily_questions(grade: int) -> list[dict]:
    seed = _today_seed(grade)
    qs: list[dict] = []
    for cat in CATEGORIES:
        c, s, off = cat["count"], seed, 0
        if cat["category"] == "math_oral":
            pool = 口算生成.generate_mental_math_all(grade, 900, seed=s)
        elif cat["category"] == "math_app":
            pool = 口算生成.generate_app_questions_all(grade, 84, seed=s)
        elif cat["category"] == "chinese_poem":
            pool = 学科出题.generate_chinese_poem(grade, c, seed=s, offset=off)
        elif cat["category"] == "chinese_reading":
            pool = 学科出题.generate_chinese_reading(grade, c, seed=s, offset=off)
        elif cat["category"] == "english_word":
            pool = 学科出题.generate_english(grade, c, seed=s, reverse=False, offset=off)
        else:
            pool = 学科出题.generate_english_sentence(grade, c, seed=s, offset=off)
        for i, q in enumerate(pool[:c]):
            q["category"] = cat["category"]
            q["category_label"] = cat["label"]
            q["category_icon"] = cat["icon"]
            qs.append(q)
    return qs


def _normalize_answer(s: str) -> str:
    return "".join(str(s).strip().lower().split())


def _grade_question(q: dict, answer: str) -> bool:
    if q.get("type") == "choice":
        return q.get("answer") == answer
    return _normalize_answer(q.get("answer", "")) == _normalize_answer(answer)


@router.get("/today", summary="今日诊断（六类题型，每日一换）")
def today_diagnosis(student_id: str, grade: int = 4) -> dict:
    today = _date.today().isoformat()
    saved = 数据库.get_daily_diagnosis(student_id, today)
    if saved:
        return {"date": today, "done_today": True, "result": saved, "questions": []}
    questions = _build_daily_questions(grade)
    return {"date": today, "done_today": False, "questions": questions}


@router.post("/daily-submit", summary="提交每日诊断：判分 + 弱项识别 + 错题入本")
def submit_daily_diagnosis(payload: DailySubmitRequest) -> dict:
    today = _date.today().isoformat()
    questions = _build_daily_questions(payload.grade)
    qmap = {q["id"]: q for q in questions}
    by_category: dict[str, list[bool]] = {}
    for ans in payload.answers:
        q = qmap.get(ans.question_id)
        if not q:
            continue
        correct = _grade_question(q, ans.answer)
        by_category.setdefault(q.get("category", ""), []).append(correct)
        if not correct:
            # 错题入本（次日复习）
            数据库.add_mistake({
                "mistake_id": f"{payload.student_id}_{ans.question_id}",
                "student_id": payload.student_id,
                "question_id": ans.question_id,
                "subject": q.get("subject", ""),
                "error_type": q.get("error_type", "概念不清"),
                "explanation": q.get("explanation", ""),
                "review_count": 0,
                "next_review_at": (datetime.now() + timedelta(days=1)).isoformat(timespec="seconds"),
            })
    scores = []
    for cat in CATEGORIES:
        results = by_category.get(cat["category"], [])
        correct = sum(1 for r in results if r)
        total = len(results) or cat["count"]
        rate = round(correct / total, 2) if total else 0.0
        scores.append({"category": cat["category"], "label": cat["label"], "icon": cat["icon"],
                       "correct": correct, "total": total, "score": rate})
    weakness = [s for s in scores if s["score"] < 0.6]
    result = {"date": today, "category_scores": scores, "weakness": weakness}
    数据库.save_daily_diagnosis(payload.student_id, today, result)
    # 写入长期记忆知识库
    summary = "；".join(f"{s['label']}{s['correct']}/{s['total']}" for s in scores)
    知识库.remember(payload.student_id, "diagnosis", f"今日诊断：{summary}", {"date": today, "weakness": [w["label"] for w in weakness]})
    if weakness:
        知识库.remember(payload.student_id, "mistake", f"弱项：{'、'.join(w['label'] for w in weakness)}，需要重点加强", {"source": "diagnosis"})
    return result
