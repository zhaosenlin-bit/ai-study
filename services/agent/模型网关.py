"""统一模型网关：业务代码不写死模型供应商。

环境变量：
- MODEL_PROVIDER=mock|spark|deepseek|qwen|minimax（默认 mock）
- <PROVIDER>_API_KEY 与 <PROVIDER>_BASE_URL（未配置则自动回退 mock，不抛错）

deepseek/qwen/minimax 走 OpenAI 兼容 HTTP 端点；spark 需要 WebSocket，留待接入。
"""

import os
from typing import Literal

import httpx

Provider = Literal["spark", "deepseek", "qwen", "minimax", "mock"]

PROVIDERS: tuple[Provider, ...] = ("spark", "deepseek", "qwen", "minimax", "mock")

DEFAULT_MODELS = {
    "deepseek": "deepseek-chat",
    "qwen": "qwen-plus",
    "minimax": "abab6.5s-chat",
    "spark": "generalv3.5",
}


def active_provider() -> Provider:
    # 兼容 MODEL_PROVIDER 与既有 LLM_PROVIDER 两种命名
    provider = os.getenv("MODEL_PROVIDER") or os.getenv("LLM_PROVIDER") or "mock"
    provider = provider.strip().lower()
    return provider if provider in PROVIDERS else "mock"


def _mock_reply(system: str, user: str) -> str:
    """无模型/未配置 Key 时的兜底回复（保持可演示）。"""
    if "为什么" in user or "怎么" in user:
        return "（mock）我们先不直接给答案。想想这个知识点的定义，再试着从题目条件一步步推理？"
    if "不会" in user or "难" in user:
        return "（mock）没关系，卡住是正常的。我陪你拆成小步骤，先只做第一步试试？"
    if "答案" in user:
        return "（mock）我可以给你提示：先找到题目里的关键词，再判断用什么方法。"
    return "（mock）收到！试着用一句话说说你的解题思路，我可以给你递进式提示。"


def complete(system: str, user: str) -> tuple[str, str]:
    """调用模型，返回（回复文本, 实际使用的 provider）。"""
    provider = active_provider()
    if provider == "mock":
        return _mock_reply(system, user), "mock"

    api_key = os.getenv(f"{provider.upper()}_API_KEY", "").strip()
    base_url = os.getenv(f"{provider.upper()}_BASE_URL", "").strip()
    if not api_key or not base_url:
        return _mock_reply(system, user), "mock"

    try:
        resp = httpx.post(
            f"{base_url}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": DEFAULT_MODELS.get(provider, "default"),
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            },
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"], provider
    except Exception:
        # 网络/鉴权失败时回退 mock，保证演示不中断
        return _mock_reply(system, user), "mock"