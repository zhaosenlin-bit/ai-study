"""SQLite 数据层：建表、读写学生画像与错题记录。

数据库文件：services/api/data/ai_study.db（已被 .gitignore 忽略）。
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "data" / "ai_study.db"


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """一键初始化：建表 + 写入演示学生。"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with _connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS students (
                student_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                grade INTEGER NOT NULL,
                mastery TEXT NOT NULL DEFAULT '{}',
                weak_points TEXT NOT NULL DEFAULT '[]',
                emotion_state TEXT,
                learning_style TEXT,
                updated_at TEXT
            );
            CREATE TABLE IF NOT EXISTS mistakes (
                mistake_id TEXT PRIMARY KEY,
                student_id TEXT NOT NULL,
                question_id TEXT NOT NULL,
                subject TEXT NOT NULL,
                error_type TEXT NOT NULL,
                explanation TEXT,
                review_count INTEGER NOT NULL DEFAULT 0,
                next_review_at TEXT,
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            );
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                display_name TEXT,
                linked_student_id TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
    seed_demo_student()


def seed_demo_student() -> None:
    """写入演示学生 stu_demo_001（小明，四年级）。"""
    with _connect() as conn:
        row = conn.execute(
            "SELECT 1 FROM students WHERE student_id = ?", ("stu_demo_001",)
        ).fetchone()
        if row:
            return
        conn.execute(
            "INSERT INTO students (student_id, name, grade, mastery, weak_points,"
            " emotion_state, learning_style, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "stu_demo_001",
                "小明",
                4,
                json.dumps(
                    {
                        "math_g4_fraction_basic": 0.45,
                        "chinese_g4_poem_author": 0.7,
                        "english_g4_food_words": 0.6,
                    },
                    ensure_ascii=False,
                ),
                json.dumps(["math_g4_fraction_basic"], ensure_ascii=False),
                "neutral",
                "visual",
                datetime.now().isoformat(timespec="seconds"),
            ),
        )


def upsert_student(profile: dict) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT INTO students (student_id, name, grade, mastery, weak_points,"
            " emotion_state, learning_style, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            " ON CONFLICT(student_id) DO UPDATE SET name=excluded.name,"
            " grade=excluded.grade, mastery=excluded.mastery,"
            " weak_points=excluded.weak_points, emotion_state=excluded.emotion_state,"
            " learning_style=excluded.learning_style, updated_at=excluded.updated_at",
            (
                profile["student_id"],
                profile["name"],
                profile["grade"],
                json.dumps(profile["mastery"], ensure_ascii=False),
                json.dumps(profile["weak_points"], ensure_ascii=False),
                profile.get("emotion_state"),
                profile.get("learning_style"),
                datetime.now().isoformat(timespec="seconds"),
            ),
        )


def load_student(student_id: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM students WHERE student_id = ?", (student_id,)
        ).fetchone()
    if not row:
        return None
    return {
        "student_id": row["student_id"],
        "name": row["name"],
        "grade": row["grade"],
        "mastery": json.loads(row["mastery"]),
        "weak_points": json.loads(row["weak_points"]),
        "emotion_state": row["emotion_state"],
        "learning_style": row["learning_style"],
        "updated_at": row["updated_at"],
    }


def add_mistake(record: dict) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO mistakes (mistake_id, student_id, question_id,"
            " subject, error_type, explanation, review_count, next_review_at)"
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                record["mistake_id"],
                record["student_id"],
                record["question_id"],
                record["subject"],
                record["error_type"],
                record.get("explanation"),
                record.get("review_count", 0),
                record.get("next_review_at"),
            ),
        )


def list_mistakes(student_id: str) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM mistakes WHERE student_id = ? ORDER BY next_review_at",
            (student_id,),
        ).fetchall()
    return [
        {
            "mistake_id": r["mistake_id"],
            "student_id": r["student_id"],
            "question_id": r["question_id"],
            "subject": r["subject"],
            "error_type": r["error_type"],
            "explanation": r["explanation"],
            "review_count": r["review_count"],
            "next_review_at": r["next_review_at"],
        }
        for r in rows
    ]


def get_user_by_username(username: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
    if not row:
        return None
    return {
        "user_id": row["user_id"],
        "username": row["username"],
        "password_hash": row["password_hash"],
        "role": row["role"],
        "display_name": row["display_name"],
        "linked_student_id": row["linked_student_id"],
        "created_at": row["created_at"],
    }


def create_user(user: dict) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT INTO users (user_id, username, password_hash, role,"
            " display_name, linked_student_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                user["user_id"],
                user["username"],
                user["password_hash"],
                user["role"],
                user.get("display_name"),
                user.get("linked_student_id"),
                user["created_at"],
            ),
        )
