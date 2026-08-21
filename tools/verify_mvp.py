# -*- coding: utf-8 -*-
"""MVP 全链路验证脚本:诊断 -> 提交 -> 画像 -> 路径 -> 对话 -> 错题 -> 复习 -> 家长报告。

用法(需后端已在 127.0.0.1:8000 运行):
    .venv/Scripts/python.exe tools/verify_mvp.py
"""
from __future__ import annotations

import sys

import httpx

BASE = "http://127.0.0.1:8000"
STUDENT = "stu_demo_001"

ok = 0
fail = 0


def check(name: str, cond: bool, detail: str = "") -> None:
    global ok, fail
    if cond:
        ok += 1
        print(f"  [PASS] {name}")
    else:
        fail += 1
        print(f"  [FAIL] {name} {detail}")


def main() -> int:
    c = httpx.Client(timeout=10)

    print("1) 健康检查")
    r = c.get(f"{BASE}/api/v1/health")
    check("GET /health -> 200", r.status_code == 200, str(r.status_code))
    check("body.status == ok", r.json().get("status") == "ok", r.text[:80])

    print("2) 开启诊断(三科 x3)")
    r = c.post(
        f"{BASE}/api/v1/diagnosis/start",
        json={"student_id": STUDENT, "grade": 4, "subjects": ["math", "chinese", "english"], "count_per_subject": 3},
    )
    session = r.json()
    check("POST /diagnosis/start -> 200", r.status_code == 200, str(r.status_code))
    qs = session.get("questions", [])
    check("返回 9 题", len(qs) == 9, f"got {len(qs)}")
    check("三科齐全", {q["subject"] for q in qs} == {"math", "chinese", "english"})
    check("均为 4 年级", all(q["grade"] == 4 for q in qs))
    sid = session["session_id"]

    print("3) 提交诊断(全部答错)")
    answers = [
        {"question_id": q["id"], "answer": (q["options"][-1] if q.get("options") else "错误答案")}
        for q in qs
    ]
    r = c.post(
        f"{BASE}/api/v1/diagnosis/submit",
        json={"session_id": sid, "student_id": STUDENT, "answers": answers},
    )
    result = r.json()
    check("POST /diagnosis/submit -> 200", r.status_code == 200, str(r.status_code))
    check("weak_points 非空", len(result.get("weak_points", [])) >= 1)
    check("recommended_path 有任务", len(result["recommended_path"]["tasks"]) >= 1)

    print("4) 学生画像")
    r = c.get(f"{BASE}/api/v1/students/{STUDENT}/profile")
    profile = r.json()
    check("GET /profile -> 200", r.status_code == 200, str(r.status_code))
    check("mastery 非空", len(profile.get("mastery", {})) >= 1)

    print("5) 学习路径")
    r = c.get(f"{BASE}/api/v1/students/{STUDENT}/path")
    path = r.json()
    check("GET /path -> 200", r.status_code == 200, str(r.status_code))
    check("tasks 非空", len(path.get("tasks", [])) >= 1)

    print("6) Agent 对话(错题追问)")
    r = c.post(
        f"{BASE}/api/v1/agent/chat",
        json={"student_id": STUDENT, "subject": "math", "message": "再给我讲讲这道题", "question_id": qs[0]["id"]},
    )
    chat = r.json()
    check("POST /agent/chat -> 200", r.status_code == 200, str(r.status_code))
    check("有回复", bool(chat.get("reply")))
    check("有 strategy", chat.get("strategy") in {"socratic", "explain", "encourage", "review", "reflect"})
    check("有 tool_trace", isinstance(chat.get("tool_trace"), list))

    print("7) 错题本")
    r = c.get(f"{BASE}/api/v1/students/{STUDENT}/mistakes")
    mistakes = r.json()
    check("GET /mistakes -> 200", r.status_code == 200, str(r.status_code))
    check("错题 >= 6", len(mistakes) >= 6, f"got {len(mistakes)}")

    print("8) 复习推荐")
    r = c.post(f"{BASE}/api/v1/review/next", json={"student_id": STUDENT, "subject": "math"})
    review = r.json()
    check("POST /review/next -> 200", r.status_code == 200, str(r.status_code))
    check("返回复习题", review.get("question", {}).get("id", "").startswith("math_q"))

    print("9) 家长报告")
    r = c.get(f"{BASE}/api/v1/reports/parent/{STUDENT}")
    report = r.json()
    check("GET /reports/parent -> 200", r.status_code == 200, str(r.status_code))
    check("有 summary", bool(report.get("summary")))
    check("有 suggestions", len(report.get("suggestions", [])) >= 1)

    print("10) OpenAPI 文档")
    r = c.get(f"{BASE}/openapi.json")
    check("GET /openapi.json -> 200", r.status_code == 200, str(r.status_code))
    paths = list(r.json().get("paths", {}).keys())
    required = [
        "/api/v1/diagnosis/start", "/api/v1/diagnosis/submit",
        "/api/v1/students/{student_id}/profile", "/api/v1/students/{student_id}/path",
        "/api/v1/agent/chat", "/api/v1/students/{student_id}/mistakes",
        "/api/v1/review/next", "/api/v1/reports/parent/{student_id}",
    ]
    check("OpenAPI 含 8 个核心路径", all(p in paths for p in required), str(paths))

    print(f"\n结果: {ok} 通过, {fail} 失败")
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
