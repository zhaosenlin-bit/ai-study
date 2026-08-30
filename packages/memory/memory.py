"""长期记忆系统：画像（JSON）+ 事件流（JSONL）+ 语义记忆（向量知识库）。

按学生隔离存储：
  <root>/<student_id>/profile.json      静态档案（画像，可增量更新）
  <root>/<student_id>/events.jsonl      事件流（append-only）
  <root>/<student_id>/kb/               语义记忆（向量知识库，随对话增长）

画像更新采用「增量 patch」：新认知覆盖旧认知，不丢历史关键字段。
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from .knowledge_base import KnowledgeBase

DEFAULT_PROFILE = {
    "student_id": "",
    "name": "同学",
    "grade": 4,
    "interest_tags": [],
    "weak_points": [],
    "learning_style": "visual",
}


class Memory:
    """按学生隔离的长期记忆：画像 / 事件 / 语义记忆。"""

    def __init__(self, student_id: str, root: str | Path):
        self.student_id = student_id
        self.dir = Path(root) / student_id
        self.dir.mkdir(parents=True, exist_ok=True)
        self.profile_path = self.dir / "profile.json"
        self.event_path = self.dir / "events.jsonl"
        self.kb = KnowledgeBase(self.dir / "kb")

    # ---------- 画像 ----------
    def load_profile(self) -> dict:
        if not self.profile_path.exists():
            return {**DEFAULT_PROFILE, "student_id": self.student_id}
        data = json.loads(self.profile_path.read_text(encoding="utf-8"))
        return {**DEFAULT_PROFILE, **data, "student_id": self.student_id}

    def update_profile(self, patch: dict) -> dict:
        """增量更新画像，返回更新后的画像。"""
        profile = self.load_profile()
        profile.update(patch)
        profile["student_id"] = self.student_id
        profile["updated_at"] = datetime.now().isoformat(timespec="seconds")
        self.profile_path.write_text(
            json.dumps(profile, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        return profile

    # ---------- 事件流 ----------
    def append_event(self, event_type: str, payload: dict) -> dict:
        event = {
            "event_id": f"evt_{uuid4().hex[:10]}",
            "ts": datetime.now().isoformat(timespec="seconds"),
            "student_id": self.student_id,
            "type": event_type,
            "payload": payload,
        }
        with self.event_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(event, ensure_ascii=False) + "\n")
        return event

    def read_events(self, limit: int | None = None) -> list[dict]:
        events: list[dict] = []
        if self.event_path.exists():
            for line in self.event_path.read_text(encoding="utf-8").splitlines():
                if line.strip():
                    events.append(json.loads(line))
        return events if limit is None else events[-limit:]

    # ---------- 语义记忆 ----------
    def remember(self, text: str, meta: dict | None = None) -> str:
        """写入一条语义记忆，返回记忆 id（随对话持续累积）。"""
        entry_id = f"mem_{uuid4().hex[:10]}"
        self.kb.add_entry(entry_id, text, {"ts": datetime.now().isoformat(timespec="seconds"), **(meta or {})})
        self.append_event("memory_written", {"memory_id": entry_id, "text": text[:80]})
        return entry_id

    def recall(self, query: str, top_k: int = 5) -> list[dict]:
        """按语义检索历史记忆（知识库召回）。"""
        return self.kb.search(query, top_k)

    def count_memories(self) -> int:
        return self.kb.count()

    def forget(self, entry_id: str) -> None:
        """删除一条记忆（满足删除请求场景）。"""
        self.kb.delete_entry(entry_id)
