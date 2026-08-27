"""ai-study 共享数据模型草案（v0.1）。

字段以 文档/api/openapi-contract-v0.yaml 为准。
字段变更必须先更新 OpenAPI 契约，再同步给角色 E 与对应学科负责人。
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class Subject(str, Enum):
    math = "math"
    chinese = "chinese"
    english = "english"
    mixed = "mixed"


class KnowledgePoint(BaseModel):
    id: str
    subject: Subject
    grade: int
    name: str
    difficulty: int = Field(ge=1, le=5)
    prerequisites: list[str] = Field(default_factory=list)
    common_misconceptions: list[str] = Field(default_factory=list)


class Question(BaseModel):
    id: str
    subject: Subject
    grade: int = Field(ge=1, le=6)
    type: str = Field(
        pattern="^(single_choice|multiple_choice|fill_blank|short_answer|dialogue)$"
    )
    stem: str
    options: list[str] | None = None
    answer: str | None = None
    knowledge_point_ids: list[str] = Field(default_factory=list)
    difficulty: int = Field(default=3, ge=1, le=5)


class Answer(BaseModel):
    question_id: str
    answer: str
    elapsed_seconds: int | None = None


class DiagnosisStartRequest(BaseModel):
    student_id: str
    grade: int = Field(ge=3, le=6)
    subjects: list[Subject]
    count_per_subject: int = 3


class DiagnosisSession(BaseModel):
    session_id: str
    student_id: str
    questions: list[Question] = Field(default_factory=list)


class DiagnosisSubmitRequest(BaseModel):
    session_id: str
    student_id: str
    answers: list[Answer]


class LearningTask(BaseModel):
    task_id: str
    subject: Subject
    title: str
    knowledge_point_id: str
    status: str = "todo"


class LearningPath(BaseModel):
    student_id: str
    tasks: list[LearningTask] = Field(default_factory=list)
    reason: str | None = None


class DiagnosisResult(BaseModel):
    student_id: str
    weak_points: list[str] = Field(default_factory=list)
    mastery_updates: dict[str, float] = Field(default_factory=dict)
    recommended_path: LearningPath


class StudentProfile(BaseModel):
    student_id: str
    name: str
    grade: int
    mastery: dict[str, float] = Field(default_factory=dict)
    weak_points: list[str] = Field(default_factory=list)
    emotion_state: str | None = None
    learning_style: str | None = None
    updated_at: datetime | None = None


class AgentChatRequest(BaseModel):
    student_id: str
    subject: Subject
    message: str
    question_id: str | None = None
    hint_level: int = Field(default=0, ge=0, le=3)


class AgentChatResponse(BaseModel):
    reply: str
    strategy: str = Field(
        pattern="^(socratic|explain|encourage|review|reflect)$"
    )
    suggested_next_question: str | None = None
    updated_profile: StudentProfile | None = None
    tool_trace: list[str] = Field(default_factory=list)


class MistakeRecord(BaseModel):
    mistake_id: str
    student_id: str
    question_id: str
    subject: Subject
    error_type: str
    explanation: str | None = None
    review_count: int = 0
    next_review_at: datetime | None = None


class ReviewNextRequest(BaseModel):
    """POST /api/v1/review/next 请求体（OpenAPI 契约内联对象）。"""

    student_id: str
    subject: Subject


class ReviewItem(BaseModel):
    review_id: str
    student_id: str
    subject: Subject
    question: Question
    due_reason: str | None = None


class ParentReport(BaseModel):
    student_id: str
    summary: str
    mastery: dict[str, float] = Field(default_factory=dict)
    mistake_stats: dict[str, int] = Field(default_factory=dict)
    suggestions: list[str] = Field(default_factory=list)