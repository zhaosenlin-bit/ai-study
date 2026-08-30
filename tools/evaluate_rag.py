"""RAG 检索质量评估：Context Precision@5 / Context Recall@10（验收项 V-2 / K-5）。

用法（仓库根）：
    .venv/Scripts/python.exe tools/evaluate_rag.py             # 用当前 embedder 配置（ollama 就绪则真实）
    .venv/Scripts/python.exe tools/evaluate_rag.py --mock      # 强制 mock embedding（链路自检）
    .venv/Scripts/python.exe tools/evaluate_rag.py --queries 50 --report deliverables/evaluation/rag_baseline.json

语料：知识点（name + 常见误区）；查询：题库随机抽 N 题（相关文档 = 题目关联知识点）。
绿灯：Context Precision@5 > 0.75 且 Context Recall@10 > 0.80。
"""
from __future__ import annotations

import argparse
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for p in (str(ROOT), str(ROOT / "services" / "api"), str(ROOT / "services")):
    if p not in sys.path:
        sys.path.insert(0, p)

from packages.memory import KnowledgeBase, active_embedding_provider  # noqa: E402
from services.agent.tools import KNOWLEDGE_POINTS, QUESTION_BANK  # noqa: E402


def build_index(kb: KnowledgeBase) -> None:
    """把知识点作为可检索语料写入知识库。"""
    for kp in KNOWLEDGE_POINTS.values():
        misconceptions = "；".join(kp.common_misconceptions) or "无"
        text = f"{kp.name}。常见误区：{misconceptions}。"
        kb.add_entry(kp.id, text, {"kind": "knowledge_point", "grade": kp.grade})


def build_queries(n: int, seed: int) -> list[dict]:
    """抽取 n 道题作为查询集，标注相关知识点 id。"""
    rng = random.Random(seed)
    sample = rng.sample(list(QUESTION_BANK), min(n, len(QUESTION_BANK)))
    return [{"query": q.stem, "relevant": set(q.knowledge_point_ids)} for q in sample]


def evaluate(queries: list[dict], kb: KnowledgeBase, top_k: int = 5, recall_k: int = 10) -> dict:
    """跑检索质量指标。每题通常关联 1 个知识点，Recall 按是否命中判 0/1。"""
    detail = []
    for q in queries:
        hits = kb.search(q["query"], top_k=recall_k)
        retrieved = [h["id"] for h in hits]
        relevant = q["relevant"]
        precision = len(set(retrieved[:top_k]) & relevant) / top_k
        recall = 1.0 if any(r in relevant for r in retrieved) else 0.0
        detail.append(
            {
                "query": q["query"][:40],
                "precision@5": round(precision, 2),
                "recall@10": recall,
                "hit_ids": retrieved[:top_k],
            }
        )
    n = len(detail)
    return {
        "provider": active_embedding_provider(),
        "sample_size": n,
        "context_precision@5": round(sum(d["precision@5"] for d in detail) / n, 4),
        "context_recall@10": round(sum(d["recall@10"] for d in detail) / n, 4),
        "pass_threshold": {"context_precision@5": 0.75, "context_recall@10": 0.80},
        "detail": detail,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mock", action="store_true", help="强制 mock embedding")
    parser.add_argument("--queries", type=int, default=50, help="查询样本数")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--report", type=str, default=None, help="报告输出路径（JSON）")
    args = parser.parse_args()

    if args.mock:
        import os

        os.environ.pop("EMBED_BASE_URL", None)

    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        kb = KnowledgeBase(Path(tmp) / "kb")
        build_index(kb)
        queries = build_queries(args.queries, args.seed)
        report = evaluate(queries, kb)

    print(json.dumps({k: v for k, v in report.items() if k != "detail"}, ensure_ascii=False, indent=2))
    passed = (
        report["context_precision@5"] > report["pass_threshold"]["context_precision@5"]
        and report["context_recall@10"] > report["pass_threshold"]["context_recall@10"]
    )
    print(f"\n结论：{'PASS 绿灯' if passed else 'FAIL 未达标'}（provider={report['provider']}）")

    if args.report:
        out = Path(args.report)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"报告已写入：{out}")
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
