"""学习接口：按学科+年级返回有序知识点列表（带掌握状态 / 锁定 / 题数）。"""

from collections import defaultdict, deque
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app import db
from services.agent.tools import KNOWLEDGE_POINTS, QUESTION_BANK

router = APIRouter(prefix="/api/v1/learning", tags=["learning"])

Subject = Literal["math", "chinese", "english"]


class LearningItem(BaseModel):
    id: str
    subject: str
    grade: int
    name: str
    difficulty: int
    prerequisites: list[str]
    status: Literal["mastered", "learning", "unstarted"]
    mastery: float
    question_count: int
    locked: bool


class LearningResponse(BaseModel):
    subject: str
    grade: int
    items: list[LearningItem]


def _topo_order(items: list, prereq_field: str) -> list:
    """Kahn 拓扑排序：只考虑子图内的依赖（跨年级/学科的前置忽略）。"""
    in_sub = {x.id for x in items}
    degree: dict[str, int] = {x.id: 0 for x in items}
    dependents: dict[str, list[str]] = defaultdict(list)
    for x in items:
        for pre in getattr(x, prereq_field, []) or []:
            if pre in in_sub:
                degree[x.id] += 1
                dependents[pre].append(x.id)

    queue = deque([k for k, d in degree.items() if d == 0])
    out: list = []
    while queue:
        k = queue.popleft()
        out.append(next(x for x in items if x.id == k))
        for nxt in dependents[k]:
            degree[nxt] -= 1
            if degree[nxt] == 0:
                queue.append(nxt)
    # 若有环，把剩余按 id 兜底追加
    if len(out) < len(items):
        seen = {x.id for x in out}
        out.extend(x for x in items if x.id not in seen)
    return out


@router.get("/{subject}", response_model=LearningResponse, summary="按学科+年级返回有序学习列表")
def get_learning(subject: str, student_id: str, grade: int) -> LearningResponse:
    if subject not in ("math", "chinese", "english"):
        raise HTTPException(status_code=400, detail={"code": "subject_invalid", "message": "学科仅支持 math/chinese/english"})
    if grade not in (3, 4, 5, 6):
        raise HTTPException(status_code=400, detail={"code": "grade_invalid", "message": "年级仅支持 3/4/5/6"})

    # 1. 知识点过滤（按学科+年级）
    kps = [kp for kp in KNOWLEDGE_POINTS.values() if kp.subject == subject and kp.grade == grade]
    if not kps:
        return LearningResponse(subject=subject, grade=grade, items=[])

    # 2. 题数统计
    qcount: dict[str, int] = defaultdict(int)
    for q in QUESTION_BANK:
        if q.subject == subject and q.grade == grade:
            for kp_id in q.knowledge_point_ids or []:
                qcount[kp_id] += 1

    # 3. 掌握度（来自学生画像）
    student = db.load_student(student_id) or {}
    mastery_map: dict[str, float] = (student.get("mastery") or {}) if isinstance(student.get("mastery"), dict) else {}

    # 4. 状态 / 锁定
    def status_of(m: float) -> str:
        if m >= 0.8:
            return "mastered"
        if m > 0:
            return "learning"
        return "unstarted"

    items_raw: list[LearningItem] = []
    for kp in kps:
        m = float(mastery_map.get(kp.id, 0.0))
        # 锁定：至少有一个子图内前置未 mastered
        in_sub = {x.id for x in kps}
        pre_in_sub = [p for p in (kp.prerequisites or []) if p in in_sub]
        locked = any(float(mastery_map.get(p, 0.0)) < 0.8 for p in pre_in_sub)
        items_raw.append(
            LearningItem(
                id=kp.id,
                subject=kp.subject,
                grade=kp.grade,
                name=kp.name,
                difficulty=kp.difficulty,
                prerequisites=list(kp.prerequisites or []),
                status=status_of(m),
                mastery=round(m, 3),
                question_count=qcount.get(kp.id, 0),
                locked=locked,
            )
        )

    # 5. 拓扑排序（先基础后进阶）
    ordered = _topo_order(items_raw, "prerequisites")
    return LearningResponse(subject=subject, grade=grade, items=ordered)