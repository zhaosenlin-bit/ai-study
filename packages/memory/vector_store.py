"""向量存储：JSON 持久化 + 余弦相似度检索。纯 Python 标准库。

数据结构：
{
  "version": 1,
  "items": [
    {"id": "...", "vector": [...], "meta": {...}}
  ]
}
"""
from __future__ import annotations

import json
import math
from pathlib import Path


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """余弦相似度；空向量按 0 处理，避免除零。"""
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


class VectorStore:
    """本地向量库：增删查，写入即落盘。"""

    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._items: list[dict] = self._load()

    def _load(self) -> list[dict]:
        if not self.path.exists():
            return []
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
            return data.get("items", []) if isinstance(data, dict) else []
        except (json.JSONDecodeError, OSError):
            return []

    def _save(self) -> None:
        self.path.write_text(
            json.dumps({"version": 1, "items": self._items}, ensure_ascii=False),
            encoding="utf-8",
        )

    def add(self, record_id: str, vector: list[float], meta: dict | None = None) -> None:
        """写入或按 id 覆盖。"""
        self._items = [i for i in self._items if i["id"] != record_id]
        self._items.append({"id": record_id, "vector": vector, "meta": meta or {}})
        self._save()

    def delete(self, record_id: str) -> None:
        """按 id 删除（源记录删除时向量同步删除）。"""
        before = len(self._items)
        self._items = [i for i in self._items if i["id"] != record_id]
        if len(self._items) != before:
            self._save()

    def count(self) -> int:
        return len(self._items)

    def get(self, record_id: str) -> dict | None:
        for i in self._items:
            if i["id"] == record_id:
                return i
        return None

    def search(self, query_vector: list[float], top_k: int = 5) -> list[dict]:
        """按余弦相似度返回 top_k，附 score。"""
        scored = sorted(
            ((cosine_similarity(query_vector, i["vector"]), i) for i in self._items),
            key=lambda x: x[0],
            reverse=True,
        )
        return [
            {"id": i["id"], "score": round(s, 4), "meta": i["meta"]}
            for s, i in scored[:top_k]
        ]

    def all(self) -> list[dict]:
        return list(self._items)
