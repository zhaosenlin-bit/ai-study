"""课程服务：3 门口算(75题) + 3 门应用题交替的课程序列，严格按顺序解锁，全对才完成。

- 数学：口算课程序生成 75 题、应用题课程序生成（购物/行程/面积等模板）
- 语文：基础课古诗填空、拓展课词语选择（内置语料生成）
- 英语：基础课看中文选英文、拓展课看英文选中文（词汇生成）
- 全部程序生成且去重：同课程内、跨课程题目都不重复
- 解锁：index 0 解锁，之后每门需前一门 completed
- 完成：全对（前端全对后调 complete 接口）
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from datetime import datetime, timedelta

from app import 数据库
from app.services import 口算生成, 学科出题
from 服务.agent.工具 import QUESTION_BANK
from 服务.agent.模型网关 import active_provider, complete

router = APIRouter(prefix="/api/v1/courses", tags=["courses"])

ORAL_PER_COURSE = 75
APP_PER_COURSE = 7   # 数学应用题课每门题数（生成）
CHINESE_ORAL_PER_COURSE = 3  # 语文基础课每门题数（古诗填空）
CHINESE_APP_PER_COURSE = 2   # 语文拓展课每门题数（词语选择）
ENGLISH_ORAL_PER_COURSE = 4  # 英语基础课每门题数（看中文选英文）
ENGLISH_APP_PER_COURSE = 4   # 英语拓展课每门题数（看英文选中文）
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
    ai_feedback: str = ""  # AI 批改评语（真实模型时生成）


class CompleteRequest(BaseModel):
    student_id: str


# ---------- 课程构建 ----------

def _pool_questions(subject: str, grade: int) -> list[dict]:
    """该学科+年级题库题（稳定顺序）。"""
    pool = [q for q in QUESTION_BANK if q.subject == subject and q.grade == grade]
    return sorted(pool, key=lambda q: q.id)


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
    if subject == "math":
        # 数学：口算与应用题都程序生成（不重复），每门固定题数，共 24 门
        per_oral = ORAL_PER_COURSE
        per_app = APP_PER_COURSE
        total_oral = ORAL_ROUND * TOTAL_ROUNDS
        total_app = APP_ROUND * TOTAL_ROUNDS
    elif subject == "chinese":
        # 语文：基础=古诗填空3题（18首×2方向=36点→12门×3）、拓展=词语选择2题（24组→12门×2）
        per_oral = CHINESE_ORAL_PER_COURSE
        per_app = CHINESE_APP_PER_COURSE
        total_oral = ORAL_ROUND * TOTAL_ROUNDS
        total_app = APP_ROUND * TOTAL_ROUNDS
    else:
        # 英语：基础/拓展都用 50 词词汇库（正向/反向题干），每门 4 题
        per_oral = ENGLISH_ORAL_PER_COURSE
        per_app = ENGLISH_APP_PER_COURSE
        total_oral = ORAL_ROUND * TOTAL_ROUNDS
        total_app = APP_ROUND * TOTAL_ROUNDS
    courses: list[Course] = []
    idx = 0
    oral_built = 0
    app_built = 0
    for r in range(1, TOTAL_ROUNDS + 1):
        # 3 门口算/基础
        for slot in range(ORAL_ROUND):
            if oral_built >= total_oral:
                break
            courses.append(
                Course(
                    course_id=f"{subject}_g{grade}_oral_{r}_{slot}",
                    index=idx,
                    name=_course_name(subject, "oral", r, slot),
                    kind="oral",
                    question_count=per_oral,
                    completed=False,
                    locked=idx > 0,
                )
            )
            idx += 1
            oral_built += 1
        # 3 门应用题/拓展
        for slot in range(APP_ROUND):
            if app_built >= total_app:
                break
            courses.append(
                Course(
                    course_id=f"{subject}_g{grade}_app_{r}_{slot}",
                    index=idx,
                    name=_course_name(subject, "app", r, slot),
                    kind="app",
                    question_count=per_app,
                    completed=False,
                    locked=idx > 0,
                )
            )
            idx += 1
            app_built += 1
    return courses


def _attach_progress(courses: list[Course], student_id: str) -> list[Course]:
    unlocked = True  # 第一门
    for c in courses:
        c.locked = not unlocked
        c.completed = 数据库.get_course_progress(student_id, c.course_id)
        if c.completed:
            unlocked = True
        else:
            unlocked = False
    return courses


# ---------- 题目 ----------

def _slice_pool(pool: list[dict], index: int, per: int) -> list[dict]:
    """按课程序号全局切分（不重复）；池用尽则返回空。"""
    start = index * per
    return pool[start:start + per]


def _questions_of(course_id: str, subject: str, grade: int, kind: str) -> list[dict]:
    parts = course_id.split("_")
    r, slot = int(parts[-2]), int(parts[-1])
    if kind == "oral":
        if subject == "math":
            # 一次性生成 12 门 × 75 = 900 题（全局去重），按课程切分
            seq = (r - 1) * ORAL_ROUND + slot
            all_qs = 口算生成.generate_mental_math_all(grade, ORAL_PER_COURSE * ORAL_ROUND * TOTAL_ROUNDS, seed=grade * 1000)
            return _slice_pool(all_qs, seq, ORAL_PER_COURSE)
        if subject == "chinese":
            seq = (r - 1) * ORAL_ROUND + slot
            return 学科出题.generate_chinese_poem(grade, CHINESE_ORAL_PER_COURSE, seed=grade * 1000 + seq * 7, offset=seq)
        # 英语基础：看中文选英文
        seq = (r - 1) * ORAL_ROUND + slot
        return 学科出题.generate_english(grade, ENGLISH_ORAL_PER_COURSE, seed=grade * 2000 + seq * 7, reverse=False, offset=seq)
    # 应用题/拓展
    if subject == "math":
        seq = (r - 1) * APP_ROUND + slot
        all_qs = 口算生成.generate_app_questions_all(grade, APP_PER_COURSE * APP_ROUND * TOTAL_ROUNDS, seed=grade * 777)
        return _slice_pool(all_qs, seq, APP_PER_COURSE)
    if subject == "chinese":
        seq = (r - 1) * APP_ROUND + slot
        return 学科出题.generate_chinese_words(grade, CHINESE_APP_PER_COURSE, seed=grade * 3000 + seq * 7, offset=seq)
    # 英语拓展：看英文选中文
    seq = (r - 1) * APP_ROUND + slot
    return 学科出题.generate_english(grade, ENGLISH_APP_PER_COURSE, seed=grade * 4000 + seq * 7, reverse=True, offset=seq)


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
    ai_feedback = _ai_mark(q, payload.answer, correct)
    _sync_mistake(payload.student_id, subject, q, correct)
    return AnswerResponse(correct=correct, explanation=q.get("explanation", ""), ai_feedback=ai_feedback)


def _ai_mark(q: dict, answer: str, correct: bool) -> str:
    """AI 批改：配置了真实模型时生成批改评语；mock 模式返回标准解析。"""
    if active_provider() == "mock":
        return ""
    try:
        system = "你是小学三到六年级的助教老师。请用一两句简短的中文点评学生的答题：答对时肯定并鼓励；答错时指出错误原因和改正方向。语气亲切，不超过50字。"
        user = (
            f"题目：{q['stem']}\n"
            f"学生答案：{answer}\n"
            f"正确答案：{q.get('answer', '')}\n"
            f"标准解析：{q.get('explanation', '')}\n"
            "请点评。"
        )
        text, _ = complete(system, user)
        return text.strip()[:200]
    except Exception:
        return ""


def _sync_mistake(student_id: str, subject: str, q: dict, correct: bool) -> None:
    """答错→错题本（次日开始复习）；答对→从错题本移除该题。"""
    if correct:
        数据库.delete_mistake(student_id, q["id"])
        return
    mistake = {
        "mistake_id": f"{student_id}_{q['id']}",
        "student_id": student_id,
        "question_id": q["id"],
        "subject": subject,
        "error_type": q.get("error_type", "概念不清"),
        "explanation": q.get("explanation", ""),
        "review_count": 0,
        "next_review_at": (datetime.now() + timedelta(days=1)).isoformat(timespec="seconds"),
    }
    数据库.add_mistake(mistake)


@router.post("/{subject}/{course_id}/complete", summary="标记课程完成（全对后调用）")
def complete_course(subject: str, course_id: str, payload: CompleteRequest) -> dict:
    数据库.set_course_progress(payload.student_id, course_id, True)
    return {"course_id": course_id, "completed": True}