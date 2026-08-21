"""Agent 服务包：LangGraph 工作流（8 节点状态机）+ 模型网关 + 工具层。

角色 A 核心：让 AI 精灵背后有可解释的 Agent 状态机、工具调用与记忆。
"""

from services.agent.nodes import GRAPH

__all__ = ["GRAPH"]
