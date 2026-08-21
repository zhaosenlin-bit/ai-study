"""Agent 对话接口。"""

from fastapi import APIRouter

from app.services import tutor
from packages.contracts.models import AgentChatRequest, AgentChatResponse

router = APIRouter(prefix="/api/v1/agent", tags=["agent"])


@router.post("/chat", response_model=AgentChatResponse, summary="Chat with tutor agent")
def chat(payload: AgentChatRequest) -> AgentChatResponse:
    return tutor.chat(payload)
