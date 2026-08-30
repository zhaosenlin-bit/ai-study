# -*- coding: utf-8 -*-
"""P0-2/P0-3 验收测试：向量存储、知识库、长期记忆。

运行（仓库根）：.venv/Scripts/python.exe -m pytest tests/memory -v
mock embedding 用于链路验证；语义精度由 tools/evaluate_rag.py 在真实服务下验收。
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
for p in (str(ROOT), str(ROOT / "services" / "api")):
    if p not in sys.path:
        sys.path.insert(0, p)

import pytest

from packages.memory import Memory, VectorStore, active_embedding_provider
from packages.memory.vector_store import cosine_similarity


@pytest.fixture(autouse=True)
def _no_external_embedding(monkeypatch):
    """测试默认走 mock embedding，避免依赖外部服务。"""
    monkeypatch.delenv("EMBED_BASE_URL", raising=False)
    monkeypatch.delenv("EMBED_MODEL", raising=False)
    assert active_embedding_provider() == "mock"


class TestVectorStore:
    def test_add_search_roundtrip(self, tmp_path):
        vs = VectorStore(tmp_path / "idx.json")
        vs.add("a", [1.0, 0.0], {"text": "分数"})
        vs.add("b", [0.0, 1.0], {"text": "小数"})
        assert vs.count() == 2
        hits = vs.search([1.0, 0.1], top_k=1)
        assert hits[0]["id"] == "a"
        assert hits[0]["score"] > 0.9

    def test_override_same_id(self, tmp_path):
        vs = VectorStore(tmp_path / "idx.json")
        vs.add("a", [1.0, 0.0], {"text": "旧"})
        vs.add("a", [0.0, 1.0], {"text": "新"})
        assert vs.count() == 1
        assert vs.get("a")["meta"]["text"] == "新"

    def test_delete_sync(self, tmp_path):
        """V-4：源删除后向量同步删除。"""
        vs = VectorStore(tmp_path / "idx.json")
        vs.add("a", [1.0, 0.0])
        vs.delete("a")
        assert vs.count() == 0
        assert vs.get("a") is None

    def test_persistence(self, tmp_path):
        path = tmp_path / "idx.json"
        vs = VectorStore(path)
        vs.add("a", [1.0, 0.0], {"text": "持久"})
        vs2 = VectorStore(path)
        assert vs2.count() == 1


class TestKnowledgeBase:
    def test_add_and_search(self, tmp_path):
        from packages.memory import KnowledgeBase

        kb = KnowledgeBase(tmp_path / "kb")
        kb.add_entry("e1", "小明怕做应用题", {"kind": "画像"})
        kb.add_entry("e2", "小明的弱点是分数加减法", {"kind": "画像"})
        assert kb.count() == 2
        hits = kb.search("小明", top_k=5)
        assert len(hits) >= 2
        assert all("score" in h for h in hits)

    def test_delete_entry(self, tmp_path):
        from packages.memory import KnowledgeBase

        kb = KnowledgeBase(tmp_path / "kb")
        kb.add_entry("e1", "记忆一")
        kb.delete_entry("e1")
        assert kb.count() == 0


class TestMemory:
    def test_profile_update(self, tmp_path):
        m = Memory("stu_t1", tmp_path / "mem")
        p = m.update_profile({"name": "小明", "grade": 5, "interest_tags": ["科幻"]})
        assert p["name"] == "小明" and p["grade"] == 5
        p2 = m.update_profile({"interest_tags": ["科幻", "数学"]})
        assert p2["interest_tags"] == ["科幻", "数学"]
        assert p2["name"] == "小明"  # 增量更新不丢旧字段

    def test_events_append_only(self, tmp_path):
        m = Memory("stu_t1", tmp_path / "mem")
        m.append_event("answer_submitted", {"question_id": "q1", "is_correct": False})
        m.append_event("answer_submitted", {"question_id": "q2", "is_correct": True})
        events = m.read_events()
        assert len(events) == 2
        assert events[-1]["payload"]["question_id"] == "q2"

    def test_remember_recall_growth(self, tmp_path):
        """A-7：记忆随对话增长，可语义召回。"""
        m = Memory("stu_t1", tmp_path / "mem")
        m.remember("小明说最近最怕解应用题")
        m.remember("小明喜欢看科幻小说")
        assert m.count_memories() == 2
        hits = m.recall("小明最近怕什么", top_k=3)
        assert len(hits) >= 1

    def test_forget(self, tmp_path):
        m = Memory("stu_t1", tmp_path / "mem")
        mid = m.remember("临时记忆")
        m.forget(mid)
        assert m.count_memories() == 0


def test_cosine_similarity():
    assert cosine_similarity([1.0, 0.0], [1.0, 0.0]) == pytest.approx(1.0)
    assert cosine_similarity([1.0, 0.0], [0.0, 1.0]) == pytest.approx(0.0)
    assert cosine_similarity([], []) == 0.0  # 空向量不除零
