"""Agent 工作流节点：load_profile -> diagnose_student -> update_mastery
-> plan_learning_path -> tutor_with_scaffolding -> record_mistake
-> schedule_review -> reflect_and_adjust。

每个节点把「输入/输出」追加到 node_logs，作为路演证据。
"""

from datetime import datetime, timedelta
from uuid import uuid4

from app import db
from packages.contracts.models import Question
from services.agent import model_gateway
from services.agent.state import AgentState
from services.agent.tools import (
    KNOWLEDGE_POINTS,
    QUESTION_BANK,
    get_scaffold_hint,
    grade_answer,
)

SUBJECT_NAMES = {"math": "数学", "chinese": "语文", "english": "英语"}


def _log(state: AgentState, node: str, detail: str) -> None:
    state.setdefault("node_logs", []).append(f"node:{node} {detail}")
    state.setdefault("tool_trace", []).append(node)


def load_profile(state: AgentState) -> AgentState:
    data = db.load_student(state["student_id"]) or {
        "student_id": state["student_id"],
        "name": "演示学生",
        "grade": 4,
        "mastery": {},
        "weak_points": [],
        "emotion_state": "neutral",
        "learning_style": "visual",
    }
    state["profile"] = data
    _log(state, "load_profile", f"读取画像 掌握度={len(data['mastery'])}项 弱项={data['weak_points']}")
    return state


def diagnose_student(state: AgentState) -> AgentState:
    """判题（如有题目）并定位学科知识点。"""
    question_id = state.get("question_id")
    message = state.get("message", "")
    if question_id:
        try:
            correct, question = grade_answer(question_id, message)
            state["is_correct"] = correct
            state["question"] = question
            _log(state, "diagnose_student", f"判题 {question_id} 结果={'正确' if correct else '错误'}")
        except StopIteration:
            _log(state, "diagnose_student", "题目不存在，跳过判题")
    else:
        _log(state, "diagnose_student", f"对话输入（无判题）：{message[:30]}")
    return state


def update_mastery(state: AgentState) -> AgentState:
    if state.get("is_correct") is None or not state.get("question"):
        _log(state, "update_mastery", "无答案提交，掌握度不变")
        return state
    profile = state["profile"]
    mastery = dict(profile["mastery"])
    for kp in state["question"].knowledge_point_ids:
        delta = 0.05 if state["is_correct"] else -0.05
        mastery[kp] = round(min(1.0, max(0.0, mastery.get(kp, 0.5) + delta)), 2)
    profile["mastery"] = mastery
    if not state["is_correct"]:
        weak = set(profile["weak_points"])
        weak.update(state["question"].knowledge_point_ids)
        profile["weak_points"] = sorted(weak)
    db.upsert_student(profile)
    _log(state, "update_mastery", f"掌握度更新 {state['question'].knowledge_point_ids}")
    return state


def plan_learning_path(state: AgentState) -> AgentState:
    profile = state["profile"]
    weak = profile.get("weak_points", [])
    if weak:
        _log(state, "plan_learning_path", f"规划路径 目标知识点={weak}")
    else:
        _log(state, "plan_learning_path", "无薄弱知识点，维持当前路径")
    return state


def tutor_with_scaffolding(state: AgentState) -> AgentState:
    """脚手架辅导：通过模型网关生成回复。"""
    subject = state.get("subject", "math")
    subject_name = SUBJECT_NAMES.get(subject, subject)
    question = state.get("question")
    kp_hint = ""
    if question:
        kp = KNOWLEDGE_POINTS.get(question.knowledge_point_ids[0])
        kp_hint = f"当前知识点：{kp.name}；常见误区：{kp.common_misconceptions}。"
    system = (
        f"你是小学{subject_name}伴学 AI 老师。坚持脚手架式引导，不直接给答案。{kp_hint}"
    )
    reply, provider = model_gateway.complete(system, state.get("message", ""))
    state["reply"] = reply
    state["strategy"] = "socratic"
    _log(state, "tutor_with_scaffolding", f"模型网关({provider})生成回复 {reply[:40]}...")
    return state


def record_mistake(state: AgentState) -> AgentState:
    if state.get("is_correct") is not False or not state.get("question"):
        _log(state, "record_mistake", "无错题，跳过")
        return state
    question = state["question"]
    db.add_mistake(
        {
            "mistake_id": f"m_{uuid4().hex[:8]}",
            "student_id": state["student_id"],
            "question_id": question.id,
            "subject": question.subject.value,
            "error_type": "概念理解错误",
            "explanation": f"错误答案：{state.get('message', '')[:40]}",
            "review_count": 0,
            "next_review_at": (datetime.now() + timedelta(hours=4)).isoformat(timespec="seconds"),
        }
    )
    _log(state, "record_mistake", f"错题入库 {question.id}")
    return state


def schedule_review(state: AgentState) -> AgentState:
    if state.get("is_correct") is not False:
        _log(state, "schedule_review", "无复习任务")
        return state
    _log(state, "schedule_review", "已安排 4 小时后复习")
    return state


def reflect_and_adjust(state: AgentState) -> AgentState:
    is_correct = state.get("is_correct")
    if is_correct is None:
        summary = "本轮为对话辅导，维持当前学习策略。"
    elif is_correct:
        summary = "学生答题正确，掌握度提升，可进入下一知识点。"
    else:
        summary = "学生答错，已记录错题并安排复习，下次辅导应降低提示层级。"
    state["summary"] = summary
    _log(state, "reflect_and_adjust", summary)
    return state


def build_graph():
    """组装 8 节点顺序工作流。"""
    from langgraph.graph import END, START, StateGraph

    builder = StateGraph(AgentState)
    builder.add_node("load_profile", load_profile)
    builder.add_node("diagnose_student", diagnose_student)
    builder.add_node("update_mastery", update_mastery)
    builder.add_node("plan_learning_path", plan_learning_path)
    builder.add_node("tutor_with_scaffolding", tutor_with_scaffolding)
    builder.add_node("record_mistake", record_mistake)
    builder.add_node("schedule_review", schedule_review)
    builder.add_node("reflect_and_adjust", reflect_and_adjust)

    builder.add_edge(START, "load_profile")
    builder.add_edge("load_profile", "diagnose_student")
    builder.add_edge("diagnose_student", "update_mastery")
    builder.add_edge("update_mastery", "plan_learning_path")
    builder.add_edge("plan_learning_path", "tutor_with_scaffolding")
    builder.add_edge("tutor_with_scaffolding", "record_mistake")
    builder.add_edge("record_mistake", "schedule_review")
    builder.add_edge("schedule_review", "reflect_and_adjust")
    builder.add_edge("reflect_and_adjust", END)
    return builder.compile()


GRAPH = build_graph()
