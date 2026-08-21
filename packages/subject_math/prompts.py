"""数学 Prompt 加载与构建：读取 prompts/math/*.md 并填充题目/学生上下文。

内置三个 Prompt（角色 B 文档要求）：
- diagnose：诊断，先判卡点再引导
- scaffold_hint：三级分步引导（方向/步骤/关键公式）
- mistake_analysis：错因归类分析
"""
from __future__ import annotations

import json
from pathlib import Path

# packages/subject_math/prompts.py -> parents[2] 为仓库根目录
PROMPT_DIR = Path(__file__).resolve().parents[2] / "prompts" / "math"

AVAILABLE_PROMPTS = ("diagnose", "scaffold_hint", "mistake_analysis")


def load_prompt(name: str) -> str:
    """读取 prompts/math/{name}.md 原文。"""
    if name not in AVAILABLE_PROMPTS:
        raise ValueError(f"未知 Prompt: {name}，可选 {AVAILABLE_PROMPTS}")
    return (PROMPT_DIR / f"{name}.md").read_text(encoding="utf-8").strip()


def build_diagnose_prompt(question: dict, student_answer=None, hint_level: int = 0) -> str:
    """构建诊断 Prompt：填入题目与当前状态。"""
    return _build("diagnose", question, student_answer, hint_level)


def build_hint_prompt(question: dict, student_answer, hint_level: int) -> str:
    """构建分步引导 Prompt：携带当前提示层级。"""
    return _build("scaffold_hint", question, student_answer, hint_level)


def build_mistake_prompt(question: dict, student_answer) -> str:
    """构建错因分析 Prompt。"""
    return _build("mistake_analysis", question, student_answer)


def _build(name: str, question: dict, student_answer, hint_level: int | None = None) -> str:
    payload = {
        "question": question,
        "student_answer": student_answer,
    }
    if hint_level is not None:
        payload["hint_level"] = hint_level
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    return f"{load_prompt(name)}\n\n# 本次输入\n{body}"
