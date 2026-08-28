"""多孩子档案管理(本地存储,可被家长切换)"""
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/children", tags=["children"])

DB_PATH = Path(__file__).resolve().parents[3] / "data" / "lingbao.db"


class Child(BaseModel):
    id: str
    name: str
    grade: int  # 3-9
    avatar: str = ""
    created_at: str


class CreateChildReq(BaseModel):
    name: str
    grade: int
    avatar: str = ""


def _conn():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    return c


def _init():
    with _conn() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS children (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, grade INTEGER NOT NULL,
            avatar TEXT, created_at TEXT NOT NULL)""")
        c.execute("""CREATE TABLE IF NOT EXISTS plans (
            plan_id TEXT PRIMARY KEY, child_id TEXT NOT NULL, date TEXT NOT NULL,
            tasks_json TEXT NOT NULL, pet_msg TEXT,
            FOREIGN KEY (child_id) REFERENCES children(id))""")
        c.execute("""CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT, child_id TEXT NOT NULL,
            task_id TEXT NOT NULL, item_id TEXT NOT NULL,
            chosen INTEGER NOT NULL, correct INTEGER NOT NULL, ts TEXT NOT NULL)""")

_init()


@router.get("", response_model=list[Child], summary="列出所有孩子")
def list_children():
    with _conn() as c:
        rows = c.execute("SELECT id, name, grade, avatar, created_at FROM children ORDER BY created_at").fetchall()
    return [dict(r) for r in rows]


@router.post("", response_model=Child, summary="创建孩子档案")
def create_child(req: CreateChildReq):
    if req.grade < 3 or req.grade > 9:
        raise HTTPException(400, "grade must be 3-9")
    cid = "child_" + datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    created_at = datetime.now().isoformat(timespec="seconds")
    with _conn() as c:
        c.execute("INSERT INTO children VALUES (?, ?, ?, ?, ?)",
                  (cid, req.name, req.grade, req.avatar, created_at))
    return Child(id=cid, name=req.name, grade=req.grade, avatar=req.avatar, created_at=created_at)


@router.get("/{child_id}", response_model=Child)
def get_child(child_id: str):
    with _conn() as c:
        r = c.execute("SELECT id, name, grade, avatar, created_at FROM children WHERE id = ?", (child_id,)).fetchone()
    if not r: raise HTTPException(404, "child not found")
    return dict(r)


@router.delete("/{child_id}")
def delete_child(child_id: str):
    with _conn() as c:
        c.execute("DELETE FROM children WHERE id = ?", (child_id,))
        c.execute("DELETE FROM plans WHERE child_id = ?", (child_id,))
        c.execute("DELETE FROM answers WHERE child_id = ?", (child_id,))
    return {"ok": true}