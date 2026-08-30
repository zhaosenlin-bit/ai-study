"""知识库：语义条目写入（文本→向量）+ 语义检索。基于本地 VectorStore。"""
from __future__ import annotations

from pathlib import Path

from . import embedder
from .vector_store import VectorStore


class KnowledgeBase:
    """用户级知识库：条目按 id 增删，按查询语义召回 top_k。"""

    def __init__(self, root: str | Path):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
        self.store = VectorStore(self.root / "kb_index.json")

    def add_entry(self, entry_id: str, text: str, meta: dict | None = None) -> None:
        """写入条目：文本向量化后入库。"""
        vector = embedder.embed([text])[0]
        self.store.add(entry_id, vector, {"text": text, **(meta or {})})

    def delete_entry(self, entry_id: str) -> None:
        self.store.delete(entry_id)

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """语义检索：返回 [{id, score, meta}]。"""
        qvec = embedder.embed([query])[0]
        return self.store.search(qvec, top_k)

    def count(self) -> int:
        return self.store.count()

    def all(self) -> list[dict]:
        return self.store.all()
