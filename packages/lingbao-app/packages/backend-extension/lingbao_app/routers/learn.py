"""学习模块:讲解 / 练习 / 答题"""
import json
import sqlite3
import os
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/learn", tags=["learn"])

ROOT = Path(__file__).resolve().parents[3] / "data"
DB_PATH = ROOT / "lingbao.db"

# 复用 ai-study-repo 的题库(JSON)
REPO_DATA = Path(__file__).resolve().parents[4] / "ai-study-repo" / "data" / "question_bank"


class ExplainReq(BaseModel):
    task_id: str
    topic: str
    grade: int
    subject: str = "math"


class PracticeReq(BaseModel):
    task_id: str
    topic: str
    grade: int
    subject: str = "math"


class AnswerReq(BaseModel):
    task_id: str
    item_id: str
    chosen_index: int
    child_id: Optional[str] = None


# 简易讲解模板(按学科+年级)
EXPLAIN_TEMPLATES = {
    "math": {
        "乘法复习": {"script": "今天我们来复习乘法!{topic}在我们生活里很常见哦~比如去超市买 3 袋糖,每袋 5 颗,一共多少颗呢? 对啦,就是 15 颗!这就是乘法的魔力!", "keyPoints": ["乘法的意义", "乘号 × 的写法", "和加法的关系"]},
        "方程":   {"script": "今天学{topic}。方程就像天平~两边必须保持平衡!比如 2x + 5 = 17,把 5 移到右边变成 2x = 12,x 就等于 6 啦!", "keyPoints": ["方程的平衡", "移项规则", "验算"]},
    },
    "chinese": {
        "识字练习": {"script": "今天我们一起认字!{topic}。先看字形,再读拼音,最后组个词~比如 '好' 字,女 + 子 = 好!", "keyPoints": ["字形结构", "拼音规则", "组词应用"]},
    },
    "english": {
        "default": {"script": "Today we learn {topic}. Practice makes perfect! Try to use it in a sentence.", "keyPoints": ["vocabulary", "pronunciation", "usage"]},
    },
}


@router.post("/explain", summary="AI 讲解(模板,可替换为模型调用)")
def explain(req: ExplainReq):
    subj_t = EXPLAIN_TEMPLATES.get(req.subject, {}).get(req.topic) or EXPLAIN_TEMPLATES.get(req.subject, {}).get("default")
    if not subj_t:
        subj_t = {"script": "今天我们来学: " + req.topic + "。仔细听灵宝讲解哦~", "keyPoints": ["基本概念", "应用场景"]}
    return {
        "task_id": req.task_id,
        "topic": req.topic,
        "script": subj_t["script"].replace("{topic}", req.topic),
        "keyPoints": subj_t["keyPoints"],
    }


@router.post("/practice", summary="出练习题")
def practice(req: PracticeReq):
    # 优先从 ai-study-repo 题库取
    qb_path = REPO_DATA / req.subject / f"g{req.grade}.json"
    items: list = []
    if qb_path.exists():
        try:
            data = json.loads(qb_path.read_text(encoding="utf-8"))
            for q in data.get("questions", [])[:5]:
                items.append({
                    "id": q.get("id", "q_" + str(len(items))),
                    "subject": req.subject,
                    "grade": req.grade,
                    "difficulty": q.get("difficulty", 1),
                    "question": q.get("stem", q.get("question", "")),
                    "options": q.get("options", []),
                    "correctIndex": q.get("correct_index", q.get("correctIndex", 0)),
                })
        except Exception as e:
            print("[learn] load qb failed:", e)
    if not items:
        items = [
            {"id": "p1", "subject": req.subject, "grade": req.grade, "difficulty": 1, "question": "7 × 8 = ?", "options": ["54", "56", "64", "72"], "correctIndex": 1},
            {"id": "p2", "subject": req.subject, "grade": req.grade, "difficulty": 2, "question": "12 × 6 = ?", "options": ["60", "66", "72", "78"], "correctIndex": 2},
            {"id": "p3", "subject": req.subject, "grade": req.grade, "difficulty": 2, "question": "9 × 9 = ?", "options": ["72", "81", "90", "99"], "correctIndex": 1},
        ]
    return {"task_id": req.task_id, "questions": items}


@router.post("/answer", summary="提交答题 + 反馈")
def answer(req: AnswerReq):
    correct = False
    correct_idx = None
    # 从 question_bank 查正确答案
    for subj in ("math", "chinese", "english"):
        for g in range(3, 10):
            p = REPO_DATA / subj / f"g{g}.json"
            if not p.exists(): continue
            try:
                d = json.loads(p.read_text(encoding="utf-8"))
                for q in d.get("questions", []):
                    if q.get("id") == req.item_id:
                        correct_idx = q.get("correct_index", q.get("correctIndex", 0))
                        correct = (correct_idx == req.chosen_index)
                        break
                if correct_idx is not None: break
            except Exception: pass
        if correct_idx is not None: break
    # mock 默认
    if correct_idx is None:
        correct_idx = 1
        correct = (correct_idx == req.chosen_index)

    # 记录
    if req.child_id:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(DB_PATH) as c:
            c.execute("CREATE TABLE IF NOT EXISTS answers (id INTEGER PRIMARY KEY AUTOINCREMENT, child_id TEXT, task_id TEXT, item_id TEXT, chosen INTEGER, correct INTEGER, ts TEXT)");
            c.execute("INSERT INTO answers (child_id, task_id, item_id, chosen, correct, ts) VALUES (?, ?, ?, ?, ?, ?)", (req.child_id, req.task_id, req.item_id, req.chosen_index, int(correct), datetime.now().isoformat(timespec="seconds")));

    return {
        "correct": correct,
        "feedback": "答对啦!你真聪明!" if correct else "没关系~我们再想想,灵宝陪你!",
        "petReaction": 38 if correct else 33,
    }