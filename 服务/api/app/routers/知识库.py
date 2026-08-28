"""用户长期记忆知识库接口：写入 + 语义检索。"""

from fastapi import APIRouter
from pydantic import BaseModel

from app import 数据库
from app.services import 知识库

router = APIRouter(prefix="/api/v1/memory", tags=["memory"])


class MemoryAddRequest(BaseModel):
    student_id: str
    kind: str  # talk / profile / diagnosis / practice / voice / image / chat / mistake
    content: str
    meta: dict = {}


class MemorySearchRequest(BaseModel):
    student_id: str
    query: str
    top_k: int = 5


@router.post("", summary="写入一条用户记忆（长期知识库）")
def add_memory(payload: MemoryAddRequest) -> dict:
    return 知识库.remember(payload.student_id, payload.kind, payload.content, payload.meta)


@router.post("/search", summary="语义检索用户记忆（快速匹配需求）")
def search_memory(payload: MemorySearchRequest) -> dict:
    return {"query": payload.query, "hits": 知识库.recall(payload.student_id, payload.query, top_k=payload.top_k)}


@router.get("/list", summary="列出用户全部记忆")
def list_memory(student_id: str) -> list[dict]:
    return 数据库.list_memories(student_id, limit=100)
