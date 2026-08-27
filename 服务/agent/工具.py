"""Agent 统一工具层：三科模块（B/C/D）通过这里接入，无需理解 Agent 内部细节。

工具：
- search_knowledge_point(subject, query, grade)
- get_diagnosis_questions(subject, grade, count)
- grade_answer(question_id, answer)
- get_scaffold_hint(question_id, answer, hint_level)
- recommend_next_tasks(student_id, subject)

数据来源：仓库 数据/knowledge_graph/{math,chinese,english}/ 与
数据/question_bank/{math,chinese,english}/（JSON 先行，决赛可迁移 Neo4j）。
"""

import json
from pathlib import Path

from 包.contracts.模型 import (
    KnowledgePoint,
    LearningTask,
    Question,
    Subject,
)

_DATA_DIR = Path(__file__).resolve().parents[2] / "数据"
_SUBJECTS = ("math", "chinese", "english")


def _load_json_list(path: Path) -> list[dict]:
    """兼容数组文件（如 math_g3.json 顶层为列表）与单对象文件（如 english_q_0001.json）。"""
    data = json.loads(path.read_text(encoding="utf-8"))
    return data if isinstance(data, list) else [data]


def _load_knowledge_points() -> dict[str, KnowledgePoint]:
    kps: dict[str, KnowledgePoint] = {}
    for subject in _SUBJECTS:
        for f in sorted((_DATA_DIR / "knowledge_graph" / subject).glob("*.json")):
            for item in _load_json_list(f):
                try:
                    kp = KnowledgePoint(**item)
                except Exception as exc:  # 跳过字段不完整的节点
                    print(f"[tools] 跳过知识点 {item.get('id')}: {exc}")
                    continue
                kps[kp.id] = kp
    return kps


def _load_questions() -> list[Question]:
    qs: list[Question] = []
    for subject in _SUBJECTS:
        for f in sorted((_DATA_DIR / "question_bank" / subject).glob("*.json")):
            for item in _load_json_list(f):
                try:
                    q = Question(**item)
                except Exception as exc:  # 跳过字段不完整的题目
                    print(f"[tools] 跳过题目 {item.get('id')}: {exc}")
                    continue
                qs.append(q)
    return qs


KNOWLEDGE_POINTS: dict[str, KnowledgePoint] = _load_knowledge_points()
QUESTION_BANK: list[Question] = _load_questions()

HINTS = [
    "先读题，圈出题目里的关键词。",
    "想想这个知识点我们学过的定义或例子。",
    "试试排除明显错误的选项，再验证剩下的。",
    "如果还是卡住，我可以给你讲解思路（不直接给答案）。",
]


def search_knowledge_point(subject: Subject, query: str, grade: int) -> list[KnowledgePoint]:
    """按科目/关键词/年级检索知识点。"""
    return [
        kp
        for kp in KNOWLEDGE_POINTS.values()
        if kp.subject == subject
        and (query in kp.name or query in kp.id or not query)
        and kp.grade == grade
    ]


def get_diagnosis_questions(subject: Subject, grade: int, count: int) -> list[Question]:
    """按科目/年级抽取诊断题。"""
    bank = [q for q in QUESTION_BANK if q.subject == subject and q.grade == grade]
    return bank[:count]


def grade_answer(question_id: str, answer: str) -> tuple[bool, Question]:
    """判题：返回（是否正确, 题目）。"""
    question = next(q for q in QUESTION_BANK if q.id == question_id)
    correct = question.answer is not None and answer.strip() == question.answer.strip()
    return correct, question


def get_scaffold_hint(question_id: str, answer: str, hint_level: int) -> str:
    """脚手架式提示：hint_level 0-3，越高级越接近讲解。"""
    question = next(q for q in QUESTION_BANK if q.id == question_id)
    level = max(0, min(3, hint_level))
    kp = KNOWLEDGE_POINTS.get(question.knowledge_point_ids[0])
    kp_name = kp.name if kp else question.knowledge_point_ids[0]
    return f"[{question.subject.value}·{kp_name}] {HINTS[level]}"


def recommend_next_tasks(student_id: str, subject: Subject) -> list[LearningTask]:
    """基于学生画像的薄弱知识点推荐任务。"""
    from app import 数据库

    data = 数据库.load_student(student_id)
    if not data:
        return []
    tasks = []
    for kp_id in data["weak_points"]:
        kp = KNOWLEDGE_POINTS.get(kp_id)
        if kp and kp.subject == subject:
            tasks.append(
                LearningTask(
                    task_id=f"task_{uuid4().hex[:8]}",
                    subject=subject,
                    title=kp.name,
                    knowledge_point_id=kp_id,
                )
            )
    return tasks