"""Embedding 抽象：OpenAI 兼容端点（ollama 默认），无可用服务时 mock 降级。

环境变量：
- EMBED_BASE_URL（默认 http://localhost:11434/v1，ollama OpenAI 兼容端点）
- EMBED_MODEL（默认 nomic-embed-text）

mock 降级返回确定性 hash 桶向量，仅用于链路测试；语义精度验收必须真实服务。
"""
from __future__ import annotations

import hashlib
import os

import httpx

DEFAULT_BASE_URL = "http://localhost:11434/v1"
DEFAULT_MODEL = "nomic-embed-text"
_MOCK_DIM = 64


def active_embedding_provider() -> str:
    """当前生效的 embedding 供应商：ollama | openai | mock。"""
    base = (os.getenv("EMBED_BASE_URL") or "").strip()
    if not base:
        return "mock"
    if "11434" in base or "ollama" in base:
        return "ollama"
    return "openai"


def _mock_embed(texts: list[str]) -> list[list[float]]:
    """确定性 mock：64 维 hash 桶向量（相同文本必有相同向量）。"""
    out = []
    for t in texts:
        h = hashlib.sha256(t.encode("utf-8")).digest()
        vec = [(h[i % 32] / 255.0) - 0.5 for i in range(_MOCK_DIM)]
        out.append(vec)
    return out


def embed(texts: list[str]) -> list[list[float]]:
    """文本批量向量化，返回 list[list[float]]。失败自动降级 mock。"""
    base = (os.getenv("EMBED_BASE_URL") or "").strip().rstrip("/")
    model = (os.getenv("EMBED_MODEL") or DEFAULT_MODEL).strip()
    if not base:
        return _mock_embed(texts)
    try:
        resp = httpx.post(
            f"{base}/embeddings",
            json={"model": model, "input": texts},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()["data"]
        return [d["embedding"] for d in data]
    except Exception:
        return _mock_embed(texts)
