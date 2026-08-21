"""错因判定：对比学生答案与标准答案，输出统一的 5 类错因标签。

错因标签与 docs/roles/02-role-b-math.md 保持一致：
careless / concept_missing / calculation_error / modeling_error / unit_error。
"""
from __future__ import annotations

ERROR_TYPE_LABELS = {
    "careless": "粗心",
    "concept_missing": "概念缺失",
    "calculation_error": "计算错误",
    "modeling_error": "应用题建模错误",
    "unit_error": "单位或量纲错误",
}

ERROR_SUGGESTIONS = {
    "careless": "建议放慢速度重新读题，核对数字与单位是否抄写正确。",
    "concept_missing": "建议先复习该知识点的定义与规则，再重新尝试。",
    "calculation_error": "建议按步骤重新计算，注意进位、退位与小数点。",
    "modeling_error": "建议先列出已知条件和数量关系，再列式计算。",
    "unit_error": "建议先统一单位，再代入计算。",
}


def normalize_answer(value) -> str:
    """答案归一化：去空白后转字符串，兼容数字与字符串答案。"""
    if value is None:
        return ""
    return str(value).strip()


def analyze_error(question: dict, student_answer) -> dict | None:
    """判定学生答案的错因。

    返回 None 表示答对；否则返回错因字典：
    {error_type, label, explanation, suggestion, knowledge_point_ids}。
    未作答时返回 {unanswered: True, ...}。
    """
    given = normalize_answer(student_answer)
    if not given:
        return {
            "unanswered": True,
            "error_type": None,
            "label": "未作答",
            "explanation": "还没有提交答案，先尝试做一做。",
            "suggestion": "",
            "knowledge_point_ids": question["knowledge_point_ids"],
        }

    if given == normalize_answer(question["answer"]):
        return None

    error_type = question.get("error_type", "calculation_error")
    return {
        "unanswered": False,
        "error_type": error_type,
        "label": ERROR_TYPE_LABELS.get(error_type, error_type),
        "explanation": question.get("explanation", ""),
        "suggestion": ERROR_SUGGESTIONS.get(error_type, ""),
        "knowledge_point_ids": question["knowledge_point_ids"],
    }
