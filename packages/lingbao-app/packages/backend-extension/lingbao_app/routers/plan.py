"""学习计划生成(基于诊断报告)"""
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any

router = APIRouter(prefix="/api/plan", tags=["plan"])
DB_PATH = Path(__file__).resolve().parents[3] / "data" / "lingbao.db"


class GeneratePlanReq(BaseModel):
    # 兼容 camelCase 输入和 snake_case Python 访问
    child_id: str = Field(..., validation_alias="childId")
    grade: int
    report: dict[str, Any]
    model_config = {"populate_by_name": True}


def _conn():
    c = sqlite3.connect(DB_PATH); c.row_factory = sqlite3.Row; return c


@router.post("/generate", summary="基于诊断生成今日计划")
def generate_plan(req: GeneratePlanReq):
    level = req.report.get("overall", {}).get("level", "B")
    weak = req.report.get("perSubject", {}).get("math", {}).get("weakTopics", []) or ["乘法"]
    today = datetime.now().strftime("%Y-%m-%d")
    plan_id = "plan_" + datetime.now().strftime("%Y%m%d%H%M%S")

    # 灵宝鼓励
    pet_msg = (
        "你太厉害啦!灵宝要跟你学习!" if level == "A" else
        "不错不错~今天我们一起攻克小难题吧!" if level == "B" else
        "没关系~灵宝陪你慢慢来,我们一起加油!"
    )

    # 任务(弱项优先)
    main_topic = weak[0] if weak else "复习"
    tasks = [
        {"id": "t1", "subject": "math", "topic": main_topic + "复习", "type": "explain", "duration": 8, "done": False},
        {"id": "t2", "subject": "math", "topic": main_topic + "练习", "type": "practice", "duration": 6, "done": False},
        {"id": "t3", "subject": "chinese", "topic": "识字练习", "type": "practice", "duration": 6, "done": False},
    ]

    with _conn() as c:
        c.execute("INSERT INTO plans VALUES (?, ?, ?, ?, ?)",
                  (plan_id, req.child_id, today, json.dumps(tasks, ensure_ascii=False), pet_msg))

    return {
        "id": plan_id,
        "child_id": req.child_id,
        "date": today,
        "tasks": tasks,
        "petEncouragement": pet_msg,
    }


@router.get("/{child_id}/today", summary="今日计划")
def get_today(child_id: str):
    today = datetime.now().strftime("%Y-%m-%d")
    with _conn() as c:
        r = c.execute("SELECT plan_id, tasks_json, pet_msg FROM plans WHERE child_id = ? AND date = ? ORDER BY plan_id DESC LIMIT 1", (child_id, today)).fetchone()
    if not r: raise HTTPException(404, "no plan today — run /api/plan/generate")
    return {
        "id": r["plan_id"],
        "child_id": child_id,
        "date": today,
        "tasks": json.loads(r["tasks_json"]),
        "petEncouragement": r["pet_msg"],
    }


class CompleteTaskReq(BaseModel):
    task_id: str


@router.post("/{plan_id}/complete", summary="标记任务完成")
def complete_task(plan_id: str, req: CompleteTaskReq):
    with _conn() as c:
        r = c.execute("SELECT tasks_json FROM plans WHERE plan_id = ?", (plan_id,)).fetchone()
    if not r: raise HTTPException(404, "plan not found")
    tasks = json.loads(r["tasks_json"])
    for t in tasks:
        if t["id"] == req.task_id: t["done"] = True
    with _conn() as c:
        c.execute("UPDATE plans SET tasks_json = ? WHERE plan_id = ?",
                  (json.dumps(tasks, ensure_ascii=False), plan_id))
    return {"ok": True, "tasks": tasks}
