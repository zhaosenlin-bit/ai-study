"""Agent 工作流状态定义。

每轮对话/诊断跑一遍 8 节点工作流，state 贯穿全程，
node_logs 记录每个节点的输入输出，供路演展示 Agent 规划、记忆、工具调用能力。
"""

from typing import TypedDict

from 包.contracts.模型 import Question


class AgentState(TypedDict, total=False):
    student_id: str
    subject: str
    message: str
    question_id: str | None
    hint_level: int
    profile: dict | None
    question: Question | None
    is_correct: bool | None
    reply: str | None
    strategy: str
    node_logs: list[str]
    tool_trace: list[str]
    summary: str | None