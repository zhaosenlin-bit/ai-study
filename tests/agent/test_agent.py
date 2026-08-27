"""Agent 层测试：工具函数、模型网关、LangGraph 节点流转。

运行（从 services/api 目录）：
    .venv/Scripts/python.exe -m pytest <仓库根绝对路径>/tests/agent -v
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app import 数据库
from packages.contracts.models import Subject
from services.agent import 模型网关
from services.agent.节点 import GRAPH
from services.agent.工具 import (
    get_diagnosis_questions,
    get_scaffold_hint,
    grade_answer,
    recommend_next_tasks,
    search_knowledge_point,
)

数据库.init_db()
# 清理上次运行残留,保证测试幂等
with 数据库._connect() as _conn:
    _conn.execute("DELETE FROM mistakes WHERE student_id = ?", ("stu_agent_test",))
    _conn.execute("DELETE FROM students WHERE student_id = ?", ("stu_agent_test",))
STUDENT_ID = "stu_agent_test"


def test_search_knowledge_point():
    result = search_knowledge_point(Subject.math, "分数", 4)
    assert len(result) >= 1
    assert "math_g4_fraction_basic" in {kp.id for kp in result}


def test_get_diagnosis_questions():
    result = get_diagnosis_questions(Subject.english, 4, 1)
    assert len(result) == 1
    assert result[0].subject == Subject.english


def test_grade_answer_correct():
    correct, question = grade_answer("math_q_g4_0012", "3/5")
    assert correct is True
    assert question.id == "math_q_g4_0012"


def test_grade_answer_wrong():
    correct, _ = grade_answer("math_q_g4_0012", "1/3")
    assert correct is False


def test_get_scaffold_hint_levels():
    h0 = get_scaffold_hint("math_q_g4_0012", "", 0)
    h3 = get_scaffold_hint("math_q_g4_0012", "", 3)
    assert h0 != h3
    assert "分数" in h0


def test_recommend_next_tasks_empty_for_unknown_student():
    assert recommend_next_tasks("stu_not_exist", Subject.math) == []


def test_model_gateway_mock_default(monkeypatch):
    monkeypatch.delenv("MODEL_PROVIDER", raising=False)
    text, provider = 模型网关.complete("system", "这道题为什么这么做？")
    assert provider == "mock"
    assert text


def test_model_gateway_fallback_without_key(monkeypatch):
    monkeypatch.setenv("MODEL_PROVIDER", "deepseek")
    monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
    monkeypatch.delenv("DEEPSEEK_BASE_URL", raising=False)
    text, provider = 模型网关.complete("system", "这题怎么做")
    assert provider == "mock"  # 无 Key 自动回退


def test_graph_runs_eight_nodes():
    result = GRAPH.invoke(
        {
            "student_id": STUDENT_ID,
            "subject": "math",
            "message": "这道题怎么做？",
        }
    )
    nodes = [log.split(" ")[0].replace("node:", "") for log in result["node_logs"]]
    assert nodes == [
        "load_profile",
        "diagnose_student",
        "update_mastery",
        "plan_learning_path",
        "tutor_with_scaffolding",
        "record_mistake",
        "schedule_review",
        "reflect_and_adjust",
    ]
    assert result["reply"]


def test_graph_judges_answer_and_records_mistake():
    result = GRAPH.invoke(
        {
            "student_id": STUDENT_ID,
            "subject": "math",
            "message": "2/4",
            "question_id": "math_q_g4_0012",
        }
    )
    assert result["is_correct"] is False
    assert any("错题入库" in log for log in result["node_logs"])
    assert any("掌握度更新" in log for log in result["node_logs"])
    mistakes = 数据库.list_mistakes(STUDENT_ID)
    assert any(m["question_id"] == "math_q_g4_0012" for m in mistakes)