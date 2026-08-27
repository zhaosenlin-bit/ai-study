# -*- coding: utf-8 -*-
"""一次性工具:从角色 A/B 的 Markdown 代码合集文档中提取代码块,还原到仓库正确目录。

文档格式:## <文件名>（<行数> 行) 后跟一个 ```python ... ``` 代码块。
同名文件(如 __init__.py)按文档出现顺序映射到不同目录。
用法: python 工具脚本/extract_role_code.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# (源文档, 目标路径列表——按代码块出现顺序)
PLANS = [
    (
        ROOT / "Agent后端与接口",
        [
            "包/contracts/__init__.py",
            "包/contracts/models.py",
            "服务/agent/__init__.py",
            "服务/agent/state.py",
            "服务/agent/tools.py",
            "服务/agent/model_gateway.py",
            "服务/agent/nodes.py",
            "服务/api/app/__init__.py",
            "服务/api/app/main.py",
            "服务/api/app/db.py",
            "服务/api/app/routers/__init__.py",
            "服务/api/app/routers/diagnosis.py",
            "服务/api/app/routers/students.py",
            "服务/api/app/routers/agent.py",
            "服务/api/app/routers/review.py",
            "服务/api/app/routers/reports.py",
            "服务/api/app/服务/__init__.py",
            "服务/api/app/服务/tutor.py",
            "测试/api/test_health.py",
            "测试/agent/test_agent.py",
        ],
    ),
    (
        ROOT / "角色B数学模块代码合集",
        [
            "包/subject_math/__init__.py",
            "包/subject_math/loader.py",
            "包/subject_math/error_analysis.py",
            "包/subject_math/path.py",
            "包/subject_math/prompts.py",
            "测试/subject_math/test_subject_math.py",
        ],
    ),
]

HEADER_RE = re.compile(r"^## (.+?)(?:（|\()")
FENCE_RE = re.compile(r"^```python\s*$", re.MULTILINE)


def extract_blocks(md: Path) -> list[str]:
    """按 ## 标题顺序提取每个代码块。"""
    text = md.read_text(encoding="utf-8")
    lines = text.splitlines()
    blocks: list[str] = []
    current: list[str] | None = None
    for line in lines:
        if line.startswith("```python"):
            current = []
        elif line.strip() == "```" and current is not None:
            blocks.append("\n".join(current).rstrip() + "\n")
            current = None
        elif current is not None:
            current.append(line)
    return blocks


def main() -> int:
    total = 0
    for md, targets in PLANS:
        if not md.exists():
            print(f"[skip] 源文件不存在: {md}")
            continue
        blocks = extract_blocks(md)
        if len(blocks) != len(targets):
            print(f"[error] {md.name}: 提取 {len(blocks)} 个代码块,但映射表只有 {len(targets)} 个,需检查")
            return 1
        for target, code in zip(targets, blocks):
            out = ROOT / target
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(code, encoding="utf-8")
            print(f"[ok] {target} ({len(code.splitlines())} 行)")
            total += 1
    print(f"完成:共还原 {total} 个文件")
    return 0


if __name__ == "__main__":
    sys.exit(main())