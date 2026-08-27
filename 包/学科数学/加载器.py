"""数学模块数据加载器：加载并校验知识图谱与题库 JSON，提供查询接口。

字段约定以 文档/api/openapi-contract-v0.yaml 的 KnowledgePoint / Question 为准，
并兼容角色 B 文档要求的内容字段（explanation / error_type）。
纯标准库实现，无第三方依赖。
"""
from __future__ import annotations

import json
from pathlib import Path

# 包/学科数学/加载器.py -> parents[2] 为仓库根目录
ROOT = Path(__file__).resolve().parents[2]
KNOWLEDGE_DIR = ROOT / "data" / "knowledge_graph" / "math"
QUESTION_DIR = ROOT / "data" / "question_bank" / "math"

VALID_ERROR_TYPES = {
    "careless",
    "concept_missing",
    "calculation_error",
    "modeling_error",
    "unit_error",
}
VALID_QUESTION_TYPES = {
    "single_choice",
    "multiple_choice",
    "fill_blank",
    "short_answer",
    "dialogue",
}


class SubjectMathData:
    """加载数学知识图谱与题库，校验数据完整性，并提供查询接口。

    :param knowledge_dir: 知识图谱目录（默认仓库 数据/knowledge_graph/math）
    :param question_dir: 题库目录（默认仓库 数据/question_bank/math）
    """

    def __init__(self, knowledge_dir: str | Path | None = None, question_dir: str | Path | None = None):
        self.knowledge_dir = Path(knowledge_dir or KNOWLEDGE_DIR)
        self.question_dir = Path(question_dir or QUESTION_DIR)
        self.knowledge_points: list[dict] = []
        self.questions: list[dict] = []
        self._kp_by_id: dict[str, dict] = {}
        self._q_by_id: dict[str, dict] = {}
        self.load()

    def load(self) -> "SubjectMathData":
        """从目录加载全部 math_g*.json / math_*.json 并校验。"""
        self.knowledge_points = []
        for f in sorted(self.knowledge_dir.glob("math_g*.json")):
            self.knowledge_points.extend(json.loads(f.read_text(encoding="utf-8")))
        self._kp_by_id = {k["id"]: k for k in self.knowledge_points}

        self.questions = []
        for f in sorted(self.question_dir.glob("math_*.json")):
            self.questions.extend(json.loads(f.read_text(encoding="utf-8")))
        self._q_by_id = {q["id"]: q for q in self.questions}

        self.validate()
        return self

    def validate(self) -> bool:
        """校验：ID 唯一、知识点引用完整、题型/错因枚举合法、选择题答案在选项中。"""
        assert len(self.knowledge_points) == len(self._kp_by_id), "knowledge point id 重复"
        assert len(self.questions) == len(self._q_by_id), "question id 重复"

        for k in self.knowledge_points:
            assert k["subject"] == "math", f'{k["id"]} subject 不是 math'
            for ref in k.get("prerequisites", []) + k.get("next", []):
                assert ref in self._kp_by_id, f'{k["id"]} 引用了不存在的知识点 {ref}'

        for q in self.questions:
            assert q["type"] in VALID_QUESTION_TYPES, f'{q["id"]} 题型非法 {q["type"]}'
            assert q["error_type"] in VALID_ERROR_TYPES, f'{q["id"]} 错因标签非法 {q["error_type"]}'
            for kid in q["knowledge_point_ids"]:
                assert kid in self._kp_by_id, f'{q["id"]} 引用了不存在的知识点 {kid}'
            if q["type"] in ("single_choice", "multiple_choice"):
                assert q["answer"] in q["options"], f'{q["id"]} 答案不在选项中'
        return True

    # ---------- 查询接口 ----------
    def get_knowledge_point(self, kp_id: str) -> dict | None:
        return self._kp_by_id.get(kp_id)

    def get_question(self, question_id: str) -> dict | None:
        return self._q_by_id.get(question_id)

    def questions_by_knowledge_point(self, kp_id: str) -> list[dict]:
        return [q for q in self.questions if kp_id in q["knowledge_point_ids"]]

    def questions_by_grade(self, grade: int, error_type: str | None = None) -> list[dict]:
        out = [q for q in self.questions if q["grade"] == grade]
        if error_type:
            out = [q for q in out if q["error_type"] == error_type]
        return out

    def questions_by_bank(self, bank: str) -> list[dict]:
        """按题库类型筛选：diagnosis / practice / review（由文件名约定识别）。"""
        if bank == "diagnosis":
            return [q for q in self.questions if q["id"].startswith("math_q_g") and "_p" not in q["id"] and "_r" not in q["id"]]
        if bank == "practice":
            return [q for q in self.questions if "_p" in q["id"]]
        if bank == "review":
            return [q for q in self.questions if "_r" in q["id"]]
        raise ValueError(f"未知题库类型: {bank}，可选 diagnosis / practice / review")

    def knowledge_point_count(self) -> int:
        return len(self.knowledge_points)

    def question_count(self) -> int:
        return len(self.questions)