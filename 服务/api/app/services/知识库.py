"""用户长期记忆知识库：本地向量检索（零外部依赖）。

- 记忆入库：对话/诊断/练习/语音/图片描述 → 写入 memories 表
- 语义检索：字符级 2-gram 哈希向量 + 余弦相似度（中文友好、零依赖）
- 后续可替换 embedding 为 minimax/云向量库，接口不变
"""

import math
import re
from collections import Counter

from app import 数据库

KIND_LABEL = {
    "talk": "谈心",
    "profile": "画像",
    "diagnosis": "诊断",
    "practice": "练习",
    "voice": "语音",
    "image": "图片",
    "chat": "对话",
    "mistake": "错题",
}

_CACHE: dict[str, Counter] = {}


def _normalize(text: str) -> str:
    """去除标点空白，保留中英文数字。"""
    return re.sub(r"[^\w\u4e00-\u9fff]", "", str(text).lower())


def _vector(text: str) -> Counter:
    """字符 2-gram 词袋向量（哈希到固定桶，控制维度）。"""
    norm = _normalize(text)
    if not norm:
        return Counter()
    vec: Counter = Counter()
    for i in range(len(norm) - 1):
        gram = norm[i : i + 2]
        vec[hash(gram) % 8192] += 1
    # 单字也计入
    for ch in norm:
        vec[hash("_" + ch) % 8192] += 1
    return vec


def _cosine(a: Counter, b: Counter) -> float:
    if not a or not b:
        return 0.0
    dot = sum(a[k] * b[k] for k in a.keys() & b.keys())
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    return dot / (na * nb) if na and nb else 0.0


def remember(student_id: str, kind: str, content: str, meta: dict | None = None) -> dict:
    """写入记忆并返回该条记录。"""
    数据库.add_memory(student_id, kind, content, meta)
    _CACHE.clear()
    return {"kind": kind, "content": content, "meta": meta or {}}


def recall(student_id: str, query: str, top_k: int = 5, min_score: float = 0.02) -> list[dict]:
    """语义检索用户历史记忆，返回最相关的 top_k 条（带相似度）。"""
    qv = _vector(query)
    results: list[dict] = []
    for m in 数据库.list_memories(student_id, limit=500):
        score = _cosine(qv, _vector(m["content"]))
        if score >= min_score:
            m["score"] = round(score, 3)
            results.append(m)
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]


def build_context(student_id: str, query: str, top_k: int = 5) -> str:
    """把召回的记忆拼成 prompt 上下文（供 AI 生成个性化内容）。"""
    hits = recall(student_id, query, top_k=top_k)
    if not hits:
        return ""
    lines = []
    for h in hits:
        label = KIND_LABEL.get(h["kind"], h["kind"])
        lines.append(f"- [{label}] {h['content']}")
    return "该学生历史记忆（供参考）：\n" + "\n".join(lines)
