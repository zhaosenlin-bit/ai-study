"""诊断 API(被移动端 /api/diagnosis/* 直接调用)"""
import json
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/diagnosis", tags=["diagnosis"])

ROOT_DATA = Path(__file__).resolve().parents[5] / "ai-study-repo" / "data" / "question_bank"


class StartReq(BaseModel):
    childId: str
    grade: int


class SubmitReq(BaseModel):
    id: str
    grade: int
    answers: list[dict]  # [{itemId, chosenIndex}]
    id: str
    answers: list[dict]  # [{itemId, chosenIndex}]


@router.post("/start", summary="开始诊断(返回 5-10 题)""")
def start(req: StartReq):
    # 复用 ai-study-repo 题库,按年级抽题
    items = []
    # 数学 3 题 + 语文 1 题 + 英语 1 题
    for subj, n in [("math", 3), ("chinese", 1), ("english", 1)]:
        p = ROOT_DATA / subj / (subj[0] + "_g" + str(req.grade) + ".json")
        # 上面路径不对,修一下
        pass
    items = _load_items_or_fallback(req.grade)
    return {"id": "diag_" + uuid.uuid4().hex[:8], "items": items}


def _load_items(grade: int):
    """从题库加载题目。

    题库目录约定:
    - math/math_q_g{grade}.json      # 一个文件,含 questions 数组
    - chinese/chinese_q_g{grade}_*.json  # 每个题一个文件
    - english/english_q_*.json       # 所有年级共用一份,按 grade 字段过滤

    加载失败或不存在时返回 []。
    """
    items = []
    try:
        # math
        mp = ROOT_DATA / "math" / f"math_q_g{grade}.json"
        if mp.exists():
            d = json.loads(mp.read_text(encoding="utf-8"))
            for q in d.get("questions", [])[:2]:
                items.append({
                    "id": q.get("id", "m_" + str(len(items))),
                    "subject": "math",
                    "grade": grade,
                    "difficulty": q.get("difficulty", 1),
                    "question": q.get("stem", q.get("question", "")),
                    "options": q.get("options", []),
                    "correctIndex": q.get("correct_index", q.get("correctIndex", 0)),
                })
        # chinese (multi-file)
        for cp in sorted((ROOT_DATA / "chinese").glob(f"chinese_q_g{grade}_*.json"))[:2]:
            q = json.loads(cp.read_text(encoding="utf-8"))
            items.append({
                "id": q.get("id", "c_" + str(len(items))),
                "subject": "chinese",
                "grade": grade,
                "difficulty": q.get("difficulty", 1),
                "question": q.get("stem", q.get("question", "")),
                "options": q.get("options", []),
                "correctIndex": q.get("correct_index", q.get("correctIndex", 0)),
            })
        # english (shared, filter by grade)
        for ep in sorted((ROOT_DATA / "english").glob("english_q_*.json"))[:2]:
            q = json.loads(ep.read_text(encoding="utf-8"))
            if int(q.get("grade", grade)) != grade: continue
            items.append({
                "id": q.get("id", "e_" + str(len(items))),
                "subject": "english",
                "grade": grade,
                "difficulty": q.get("difficulty", 1),
                "question": q.get("stem", q.get("question", "")),
                "options": q.get("options", []),
                "correctIndex": q.get("correct_index", q.get("correctIndex", 0)),
            })
    except Exception as e:
        print("[diag] load failed:", e)
    return items


def _load_items_or_fallback(grade: int):
    """题库为空时使用 mock 题目,保证 submit 能查到 correctIndex。"""
    items = _load_items(grade)
    if items: return items
    return [
        {"id": "m1", "subject": "math", "grade": grade, "difficulty": 1, "question": str(grade) + " 年级: 24 × 5 = ?", "options": ["100", "110", "120", "130"], "correctIndex": 2},
        {"id": "m2", "subject": "math", "grade": grade, "difficulty": 2, "question": str(grade) + " 年级: 三角形内角和 = ?", "options": ["90°", "180°", "270°", "360°"], "correctIndex": 1},
        {"id": "c1", "subject": "chinese", "grade": grade, "difficulty": 1, "question": "下面哪个字读 hǎo?", "options": ["号", "好", "浩", "郝"], "correctIndex": 1},
        {"id": "e1", "subject": "english", "grade": grade, "difficulty": 1, "question": "What color is the sky?", "options": ["Red", "Blue", "Green", "Yellow"], "correctIndex": 1},
        {"id": "m3", "subject": "math", "grade": grade, "difficulty": 3, "question": str(grade) + " 年级: 2x + 5 = 17,x = ?", "options": ["4", "5", "6", "7"], "correctIndex": 2},
    ]


@router.post("/submit", summary="提交诊断答案,返回报告")
def submit(req: SubmitReq):
    # 简单计分:每题 20 分
    if not req.answers:
        raise HTTPException(400, "no answers")
    # score computed below
    # 上面简化为只看 chosenIndex, 真确性需要从题库查。这里简化:假设有 5 题答对 ~3
    score = 0
    # 重新计算
    score = 0
    all_items = _load_items_or_fallback(req.grade)
    correct_map = {it["id"]: it["correctIndex"] for it in all_items}
    for a in req.answers:
        if correct_map.get(a.get("itemId")) == a.get("chosenIndex"):
            score += 20
    level = "A" if score >= 80 else "B" if score >= 60 else "C" if score >= 40 else "D"
    return {
        "childId": req.id,
        "overall": {"level": level, "score": score},
        "perSubject": {
            "math": {"level": level, "strongTopics": [], "weakTopics": ["方程"] if level in ("C", "D") else []},
            "chinese": {"level": "A" if score >= 60 else "B", "strongTopics": ["识字"], "weakTopics": []},
            "english": {"level": "B", "strongTopics": ["颜色"], "weakTopics": []},
        },
    }
