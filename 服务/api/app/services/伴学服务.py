"""Agent 核心闭环服务（MVP 规则版，未接 LLM）。

闭环：诊断评分 -> 掌握度更新 -> 路径规划 -> 对话辅导 -> 错题记录 -> 复习调度 -> 家长报告。
后续将替换为 服务/agent 的 LangGraph 工作流，本服务保持接口不变。
"""

from datetime import datetime, timedelta
from uuid import uuid4

from 包.contracts.模型 import (
    AgentChatRequest,
    AgentChatResponse,
    Answer,
    DiagnosisResult,
    DiagnosisSession,
    DiagnosisStartRequest,
    LearningPath,
    LearningTask,
    MistakeRecord,
    ParentReport,
    ReviewItem,
    StudentProfile,
    Subject,
)

from app import 数据库
from 服务.agent.工具 import KNOWLEDGE_POINTS, QUESTION_BANK

KNOWLEDGE_POINT_NAMES = {kp.id: kp.name for kp in KNOWLEDGE_POINTS.values()}


def _profile_to_schema(data: dict) -> StudentProfile:
    return StudentProfile(
        student_id=data["student_id"],
        name=data["name"],
        grade=data["grade"],
        mastery=data["mastery"],
        weak_points=data["weak_points"],
        emotion_state=data.get("emotion_state"),
        learning_style=data.get("learning_style"),
        updated_at=data.get("updated_at"),
    )


def _ensure_student(student_id: str, grade: int) -> dict:
    data = 数据库.load_student(student_id)
    if data is None:
        data = {
            "student_id": student_id,
            "name": "演示学生",
            "grade": grade,
            "mastery": {},
            "weak_points": [],
            "emotion_state": "neutral",
            "learning_style": "visual",
            "updated_at": None,
        }
        数据库.upsert_student(data)
    return data


def start_diagnosis(payload: DiagnosisStartRequest) -> DiagnosisSession:
    _ensure_student(payload.student_id, payload.grade)
    questions = []
    for sub in payload.subjects:
        sub_qs = [
            q for q in QUESTION_BANK
            if q.subject == sub and q.grade == payload.grade
        ]
        questions.extend(sub_qs[: payload.count_per_subject])
    return DiagnosisSession(
        session_id=f"diag_{uuid4().hex[:8]}",
        student_id=payload.student_id,
        questions=questions,
    )


def submit_diagnosis(session_id: str, student_id: str, answers: list[Answer]) -> DiagnosisResult:
    """评分 -> 更新掌握度 -> 记录错题 -> 规划路径。"""
    student = _ensure_student(student_id, 4)
    mastery = dict(student["mastery"])
    weak_points = set(student["weak_points"])
    bank = {q.id: q for q in QUESTION_BANK}
    mastery_updates: dict[str, float] = {}

    for ans in answers:
        question = bank.get(ans.question_id)
        if question is None:
            continue
        correct = question.answer is not None and ans.answer.strip() == question.answer.strip()
        for kp in question.knowledge_point_ids:
            delta = 0.15 if correct else -0.1
            mastery[kp] = round(min(1.0, max(0.0, mastery.get(kp, 0.5) + delta)), 2)
            mastery_updates[kp] = mastery[kp]
            if not correct and mastery[kp] < 0.6:
                weak_points.add(kp)
                数据库.add_mistake(
                    {
                        "mistake_id": f"m_{uuid4().hex[:8]}",
                        "student_id": student_id,
                        "question_id": question.id,
                        "subject": question.subject.value,
                        "error_type": "未作答" if not ans.answer.strip() else "概念理解错误",
                        "explanation": f"错误答案：{ans.answer}",
                        "review_count": 0,
                        "next_review_at": (datetime.now() + timedelta(hours=4)).isoformat(
                            timespec="seconds"
                        ),
                    }
                )

    student["mastery"] = mastery
    student["weak_points"] = sorted(weak_points)
    数据库.upsert_student(student)

    path = LearningPath(
        student_id=student_id,
        tasks=[
            LearningTask(
                task_id=f"task_{uuid4().hex[:8]}",
                subject=_subject_of_kp(kp),
                title=KNOWLEDGE_POINT_NAMES.get(kp, kp),
                knowledge_point_id=kp,
            )
            for kp in student["weak_points"]
        ],
        reason="根据诊断结果，从薄弱知识点生成今日学习任务。",
    )
    return DiagnosisResult(
        student_id=student_id,
        weak_points=student["weak_points"],
        mastery_updates=mastery_updates,
        recommended_path=path,
    )


def _subject_of_kp(kp: str) -> Subject:
    if kp.startswith("math_"):
        return Subject.math
    if kp.startswith("chinese_"):
        return Subject.chinese
    if kp.startswith("english_"):
        return Subject.english
    return Subject.mixed


def get_profile(student_id: str) -> StudentProfile:
    data = 数据库.load_student(student_id)
    if data is None:
        data = _ensure_student(student_id, 4)
    return _profile_to_schema(data)


def get_path(student_id: str) -> LearningPath:
    data = 数据库.load_student(student_id) or _ensure_student(student_id, 4)
    return LearningPath(
        student_id=student_id,
        tasks=[
            LearningTask(
                task_id=f"task_{kp}",
                subject=_subject_of_kp(kp),
                title=KNOWLEDGE_POINT_NAMES.get(kp, kp),
                knowledge_point_id=kp,
            )
            for kp in data["weak_points"]
        ],
        reason="按薄弱知识点持续生成学习路径。",
    )


def chat(payload: AgentChatRequest) -> AgentChatResponse:
    """对话辅导：跑 LangGraph 8 节点工作流，返回节点流转日志作为路演证据。"""
    from 服务.agent.节点 import GRAPH

    result = GRAPH.invoke(
        {
            "student_id": payload.student_id,
            "subject": payload.subject.value,
            "message": payload.message,
            "question_id": payload.question_id,
            "hint_level": payload.hint_level,
        }
    )
    return AgentChatResponse(
        reply=result.get("reply") or "（无回复）",
        strategy=result.get("strategy", "socratic"),
        suggested_next_question="试着用一句话说说你的解题思路？",
        updated_profile=get_profile(payload.student_id),
        tool_trace=result.get("node_logs", []),
    )


def get_mistakes(student_id: str) -> list[MistakeRecord]:
    return [
        MistakeRecord(
            mistake_id=r["mistake_id"],
            student_id=r["student_id"],
            question_id=r["question_id"],
            subject=r["subject"],
            error_type=r["error_type"],
            explanation=r["explanation"],
            review_count=r["review_count"],
            next_review_at=r["next_review_at"],
        )
        for r in 数据库.list_mistakes(student_id)
    ]


def review_next(student_id: str, subject: Subject) -> ReviewItem:
    mistakes = [
        r
        for r in 数据库.list_mistakes(student_id)
        if r["subject"] == subject.value
    ]
    # 优先复习库中仍存在的错题(跳过题库中已下架的题)
    for mistake in mistakes:
        question = next((q for q in QUESTION_BANK if q.id == mistake["question_id"]), None)
        if question is None:
            continue
        return ReviewItem(
            review_id=f"rev_{uuid4().hex[:8]}",
            student_id=student_id,
            subject=subject,
            question=question,
            due_reason=f"错题复习（{mistake['error_type']}），复习次数 {mistake['review_count']}",
        )
    # 无可用错题时返回一道基础题作为复习内容
    question = next(q for q in QUESTION_BANK if q.subject == subject)
    return ReviewItem(
        review_id=f"rev_{uuid4().hex[:8]}",
        student_id=student_id,
        subject=subject,
        question=question,
        due_reason="当前无到期错题，安排基础巩固题。",
    )


def parent_report(student_id: str) -> ParentReport:
    profile = get_profile(student_id)
    mistakes = get_mistakes(student_id)
    stats: dict[str, int] = {}
    for m in mistakes:
        stats[m.error_type] = stats.get(m.error_type, 0) + 1

    avg = sum(profile.mastery.values()) / len(profile.mastery) if profile.mastery else 0.0
    if not profile.weak_points:
        summary = "孩子当前没有明显薄弱项，继续保持学习节奏即可。"
    elif avg >= 0.6:
        summary = "整体掌握度良好，薄弱点集中在少量知识点，建议按路径针对性练习。"
    else:
        summary = "部分知识点掌握不足，建议优先完成今日学习路径并加强错题复习。"

    return ParentReport(
        student_id=student_id,
        summary=summary,
        mastery=profile.mastery,
        mistake_stats=stats,
        suggestions=[
            f"重点练习：{KNOWLEDGE_POINT_NAMES.get(kp, kp)}"
            for kp in profile.weak_points
        ],
    )