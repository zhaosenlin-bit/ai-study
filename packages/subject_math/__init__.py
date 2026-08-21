"""subject_math：角色 B 数学模块可运行代码包。

提供：
- SubjectMathData：知识图谱/题库加载、校验与查询
- analyze_error：5 类错因判定
- collect_prerequisites / recommend_path：学习路径推荐
- load_prompt / build_*_prompt：数学 Prompt 加载与构建
"""
from .error_analysis import ERROR_SUGGESTIONS, ERROR_TYPE_LABELS, analyze_error
from .loader import SubjectMathData
from .path import collect_prerequisites, recommend_path
from .prompts import (
    build_diagnose_prompt,
    build_hint_prompt,
    build_mistake_prompt,
    load_prompt,
)

__all__ = [
    "SubjectMathData",
    "analyze_error",
    "ERROR_TYPE_LABELS",
    "ERROR_SUGGESTIONS",
    "collect_prerequisites",
    "recommend_path",
    "load_prompt",
    "build_diagnose_prompt",
    "build_hint_prompt",
    "build_mistake_prompt",
]

__version__ = "0.1.0"
