"""课程服务：3 门口算(75题) + 3 门应用题交替的课程序列，严格按顺序解锁，全对才完成。

- 口算课：程序生成 75 道口算题（按年级难度）
- 应用题课：该学科+年级题库中的应用题（均分 3 门）
- 解锁：index 0 解锁，之后每门需前一门 completed
- 完成：全对（前端全对后调 complete 接口）
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app import db
from app.services import mental_math
from services.agent.tools import QUESTION_BANK

router = APIRouter(prefix="/api/v1/courses", tags=["courses"])

ORAL_PER_COURSE = 75
ORAL_ROUND = 3   # 每轮 3 门口算
APP_ROUND = 3    # 每轮 3 门应用题
TOTAL_ROUNDS = 4  # 共 4 轮 → 每年级 24 门课

SUBJECTS = ("math", "chinese", "english")


class Course(BaseModel):
    course_id: str
    index: int
    name: str
    kind: str  # oral | app
    question_count: int
    completed: bool
    locked: bool


class CourseListResponse(BaseModel):
    subject: str
    grade: int
    courses: list[Course]


class QuestionOut(BaseModel):
    id: str
    type: str
    stem: str
    options: list[str] | None
    difficulty: int


class AnswerRequest(BaseModel):
    student_id: str
    question_id: str
    answer: str


class AnswerResponse(BaseModel):
    correct: bool
    explanation: str


class CompleteRequest(BaseModel):
    student_id: str


# ---------- 课程构建 ----------

def _pool_questions(subject: str, grade: int) -> list[dict]:
    """该学科+年级题库题（稳定顺序）。"""
    pool = [q for q in QUESTION_BANK if q.subject == subject and q.grade == grade]
    return sorted(pool, key=lambda q: q.id)


def _app_questions(subject: str, grade: int) -> list[dict]:
    """应用题/拓展题 = 题库全量（数学区分口算与其它；语文英语基础+阅读都在题库）。"""
    return _pool_questions(subject, grade)


def _oral_pool(subject: str, grade: int) -> list[dict] | None:
    """返回基础题库池；math 返回 None（走生成器）。"""
    if subject == "math":
        return None
    return _pool_questions(subject, grade)


def _course_name(subject: str, kind: str, round_no: int, slot: int) -> str:
    if subject != "math":
        if kind == "oral":
            names = ["基础入门", "基础进阶", "基础挑战"]
            return f"基础练习{round_no}·{names[slot]}"
        return f"综合拓展{round_no}·{slot + 1}"
    if kind == "oral":
        names = ["口算入门", "口算进阶", "口算挑战"]
        return f"口算练习{round_no}·{names[slot]}"
    return f"经典应用题{round_no}·{slot + 1}"


def build_courses(subject: str, grade: int) -> list[Course]:
    pool = _pool_questions(subject, grade)
    oral_pool = _oral_pool(subject, grade)
    # 数学口算 75 题；语文英语基础课 = 题库均分 3 门（取每门题数）
    if subject == "math":
        oral_count = ORAL_PER_COURSE
        oral_per_course = ORAL_PER_COURSE
    else:
        oral_per_course = max(1, len(oral_pool) // ORAL_ROUND) if oral_pool else 0
        oral_count = oral_per_course
    app_per_course = max(1, len(pool) // APP_ROUND)
    courses: list[Course] = []
    idx = 0
    for r in range(1, TOTAL_ROUNDS + 1):
        # 3 门口算/基础
        for slot in range(ORAL_ROUND):
            if oral_count <= 0:
                break
            courses.append(
                Course(
                    course_id=f"{subject}_g{grade}_oral_{r}_{slot}",
                    index=idx,
                    name=_course_name(subject, "oral", r, slot),
                    kind="oral",
                    question_count=oral_count,
                    completed=False,
                    locked=idx > 0,
                )
            )
            idx += 1
        # 3 门应用题/拓展（题库不足时循环取题，保证每门满 app_per_course）
        if pool:
            for slot in range(APP_ROUND):
                courses.append(
                    Course(
                        course_id=f"{subject}_g{grade}_app_{r}_{slot}",
                        index=idx,
                        name=_course_name(subject, "app", r, slot),
                        kind="app",
                        question_count=app_per_course,
                        completed=False,
                        locked=idx > 0,
                    )
                )
                idx += 1
    return courses


def _attach_progress(courses: list[Course], student_id: str) -> list[Course]:
    unlocked = True  # 第一门
    for c in courses:
        c.locked = not unlocked
        c.completed = db.get_course_progress(student_id, c.course_id)
        if c.completed:
            unlocked = True
        else:
            unlocked = False
    return courses


# ---------- 题目 ----------

def _round_robin(pool: list[dict], start: int, count: int) -> list[dict]:
    """不足时循环取题，保证每门课固定 count 题（经典题重复练习）。"""
    if not pool:
        return []
    return [pool[(start + i) % len(pool)] for i in range(count)]


def _questions_of(course_id: str, subject: str, grade: int, kind: str) -> list[dict]:
    parts = course_id.split("_")
    if kind == "oral":
        if subject == "math":
            r, slot = int(parts[-2]), int(parts[-1])
            return mental_math.generate_mental_math(grade, ORAL_PER_COURSE, seed=int(r) * 31 + int(slot))
        # 语文/英语基础课：题库均分（不足循环）
        pool = _pool_questions(subject, grade)
        per = max(1, len(pool) // ORAL_ROUND)
        r, slot = int(parts[-2]), int(parts[-1])
        return _round_robin(pool, slot * per, per)
    pool = _pool_questions(subject, grade)
    app_per_course = max(1, len(pool) // APP_ROUND)
    r, slot = int(parts[-2]), int(parts[-1])
    return _round_robin(pool, slot * app_per_course, app_per_course)


# ---------- 判题 ----------

def _normalize(s: str) -> str:
    s = s.strip().replace("，", "").replace(",", "").replace(" ", "").lower()
    return s


def _qdict(q) -> dict:
    """Question 对象或 dict 统一转 dict。"""
    if isinstance(q, dict):
        return q
    return q.model_dump()


def _grade(question: dict, answer: str) -> bool:
    qtype = question.get("type")
    if qtype == "single_choice":
        return _normalize(answer) == _normalize(question.get("answer", ""))
    # fill_blank / 其他：数字或分数
    expected = _normalize(str(question.get("answer", "")))
    return _normalize(answer) == expected


# ---------- 接口 ----------

@router.get("/{subject}", response_model=CourseListResponse, summary="按学科+年级返回课程序列")
def list_courses(subject: str, student_id: str, grade: int) -> CourseListResponse:
    if subject not in SUBJECTS:
        raise HTTPException(status_code=400, detail={"code": "subject_invalid", "message": "学科仅支持 math/chinese/english"})
    if grade not in (3, 4, 5, 6):
        raise HTTPException(status_code=400, detail={"code": "grade_invalid", "message": "年级仅支持 3/4/5/6"})
    courses = _attach_progress(build_courses(subject, grade), student_id)
    return CourseListResponse(subject=subject, grade=grade, courses=courses)


@router.get("/{subject}/{course_id}/questions", response_model=list[QuestionOut], summary="课程题目")
def course_questions(subject: str, course_id: str) -> list[QuestionOut]:
    parts = course_id.split("_")
    grade = int(parts[1][1:])  # "g4" -> 4
    kind = parts[2]
    qs = [_qdict(x) for x in _questions_of(course_id, subject, grade, kind)]
    return [
        QuestionOut(
            id=q["id"],
            type=q.get("type", "fill_blank"),
            stem=q["stem"],
            options=list(q["options"]) if q.get("options") else None,
            difficulty=q.get("difficulty", 1),
        )
        for q in qs
    ]


@router.post("/{subject}/{course_id}/answer", response_model=AnswerResponse, summary="判题（单题）")
def answer_question(subject: str, course_id: str, payload: AnswerRequest) -> AnswerResponse:
    parts = course_id.split("_")
    grade = int(parts[1][1:])
    kind = parts[2]
    qs = [_qdict(x) for x in _questions_of(course_id, subject, grade, kind)]
    q = next((x for x in qs if x["id"] == payload.question_id), None)
    if not q:
        raise HTTPException(status_code=404, detail={"code": "question_not_found", "message": "题目不存在"})
    correct = _grade(q, payload.answer)
    return AnswerResponse(correct=correct, explanation=q.get("explanation", ""))


@router.post("/{subject}/{course_id}/complete", summary="标记课程完成（全对后调用）")
def complete_course(subject: str, course_id: str, payload: CompleteRequest) -> dict:
    db.set_course_progress(payload.student_id, course_id, True)
    return {"course_id": course_id, "completed": True}
