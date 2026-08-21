"""学习路径辅助：知识点前置依赖链收集与薄弱点路径推荐。

输出结构对齐 OpenAPI 的 LearningTask：
{task_id, subject, title, knowledge_point_id, status}。
"""
from __future__ import annotations

DEFAULT_THRESHOLD = 0.6  # 掌握度低于该值视为薄弱


def collect_prerequisites(kp_id: str, kp_by_id: dict[str, dict], _seen: set[str] | None = None) -> list[str]:
    """收集某知识点全部前置知识点 id（含间接），按依赖深度优先排序（先基础后进阶）。"""
    seen = set() if _seen is None else _seen
    kp = kp_by_id.get(kp_id)
    if kp is None or kp_id in seen:
        return []
    seen.add(kp_id)
    chain: list[str] = []
    for pre in kp.get("prerequisites", []):
        chain.extend(collect_prerequisites(pre, kp_by_id, seen))
        chain.append(pre)
    return chain


def recommend_path(
    mastery: dict[str, float],
    kp_by_id: dict[str, dict],
    subject: str = "math",
    threshold: float = DEFAULT_THRESHOLD,
    limit: int = 5,
) -> list[dict]:
    """根据掌握度生成学习任务列表。

    :param mastery: {知识点 id: 掌握度 0~1}
    :param kp_by_id: 知识点 id 映射表（来自 SubjectMathData）
    :param subject: 学科过滤，默认 math
    :param threshold: 掌握度阈值，低于视为薄弱
    :param limit: 最多生成任务数
    """
    tasks: list[dict] = []
    seen: set[str] = set()

    weak = [(kid, score) for kid, score in mastery.items() if score < threshold]
    weak.sort(key=lambda kv: kv[1])  # 掌握度最低的优先

    for kp_id, _score in weak:
        kp = kp_by_id.get(kp_id)
        if kp is None or kp.get("subject") != subject:
            continue
        # 先补前置知识，再补本知识点
        for pre in collect_prerequisites(kp_id, kp_by_id):
            if pre not in seen:
                seen.add(pre)
                tasks.append(_make_task(pre, kp_by_id[pre]["name"]))
        if kp_id not in seen:
            seen.add(kp_id)
            tasks.append(_make_task(kp_id, kp["name"]))
        if len(tasks) >= limit:
            break
    return tasks[:limit]


def _make_task(kp_id: str, title: str) -> dict:
    return {
        "task_id": f"task_{kp_id}",
        "subject": "math",
        "title": title,
        "knowledge_point_id": kp_id,
        "status": "todo",
    }
