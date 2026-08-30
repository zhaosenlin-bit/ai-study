"""记忆模块：长期记忆（Memory）、知识库（KnowledgeBase）、向量存储（VectorStore）。

- Memory：画像 + 事件流 + 语义记忆（用户级长期记忆）
- KnowledgeBase：语义条目写入与检索
- VectorStore：本地向量存储（余弦相似度）
- embedder：embedding 抽象（ollama / OpenAI 兼容 / mock 降级）
"""
from .embedder import active_embedding_provider, embed
from .knowledge_base import KnowledgeBase
from .memory import Memory
from .vector_store import VectorStore, cosine_similarity

__all__ = [
    "Memory",
    "KnowledgeBase",
    "VectorStore",
    "cosine_similarity",
    "embed",
    "active_embedding_provider",
]
