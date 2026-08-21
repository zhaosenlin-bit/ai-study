"""接口测试：health、诊断闭环、画像、路径、对话、错题、复习、家长报告。

运行（从 services/api 目录）：
    .venv/Scripts/python.exe -m pytest <仓库根绝对路径>/tests/api -v
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient

from app import db
from app.main import app

db.init_db()
# 清理上次运行残留,保证测试幂等
with db._connect() as _conn:
    _conn.execute("DELETE FROM mistakes WHERE student_id = ?", ("stu_test_001",))
    _conn.execute("DELETE FROM students WHERE student_id = ?", ("stu_test_001",))
client = TestClient(app)

STUDENT_ID = "stu_test_001"


def _start_diagnosis(subjects=None):
    resp = client.post(
        "/api/v1/diagnosis/start",
        json={
            "student_id": STUDENT_ID,
            "grade": 4,
            "subjects": subjects or ["math", "chinese", "english"],
        },
    )
    assert resp.status_code == 200
    return resp.json()


def test_health():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_diagnosis_start_returns_questions():
    data = _start_diagnosis(["math", "chinese", "english"])
    assert data["student_id"] == STUDENT_ID
    assert len(data["questions"]) == 9  # 3 科 × count_per_subject=3
    assert {q["subject"] for q in data["questions"]} == {"math", "chinese", "english"}


def test_diagnosis_start_filters_by_subject():
    data = _start_diagnosis(["math"])
    assert len(data["questions"]) == 3
    assert all(q["subject"] == "math" for q in data["questions"])


def test_diagnosis_submit_full_loop():
    """诊断 -> 路径闭环：答错题目后弱项进入画像与错题本。"""
    data = _start_diagnosis(["math", "chinese", "english"])
    session_id = data["session_id"]
    answers = []
    for q in data["questions"]:
        wrong = q["options"][-1] if q["options"] else "错误答案"
        answers.append({"question_id": q["id"], "answer": wrong})
    resp = client.post(
        "/api/v1/diagnosis/submit",
        json={"session_id": session_id, "student_id": STUDENT_ID, "answers": answers},
    )
    assert resp.status_code == 200
    result = resp.json()
    assert result["student_id"] == STUDENT_ID
    assert len(result["weak_points"]) >= 1
    assert result["mastery_updates"]
    assert len(result["recommended_path"]["tasks"]) >= 1

    # 错题已入错题本
    mistakes = client.get(f"/api/v1/students/{STUDENT_ID}/mistakes").json()
    assert len(mistakes) >= 6


def test_profile_and_path():
    profile = client.get(f"/api/v1/students/{STUDENT_ID}/profile").json()
    assert profile["student_id"] == STUDENT_ID
    assert "mastery" in profile

    path = client.get(f"/api/v1/students/{STUDENT_ID}/path").json()
    assert path["student_id"] == STUDENT_ID


def test_agent_chat_returns_tool_trace():
    resp = client.post(
        "/api/v1/agent/chat",
        json={
            "student_id": STUDENT_ID,
            "subject": "math",
            "message": "这题为什么这样做？",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["strategy"] in ("socratic", "explain", "encourage", "review", "reflect")
    assert len(data["tool_trace"]) >= 1
    assert data["updated_profile"]["student_id"] == STUDENT_ID


def test_review_next_returns_question():
    resp = client.post(
        "/api/v1/review/next",
        json={"student_id": STUDENT_ID, "subject": "math"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["student_id"] == STUDENT_ID
    assert data["question"]["subject"] == "math"


def test_parent_report():
    resp = client.get(f"/api/v1/reports/parent/{STUDENT_ID}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["student_id"] == STUDENT_ID
    assert "summary" in data
    assert "suggestions" in data


def test_swagger_docs_accessible():
    resp = client.get("/docs")
    assert resp.status_code == 200
    assert "swagger" in resp.text.lower()
