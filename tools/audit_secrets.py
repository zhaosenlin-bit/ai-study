"""密钥/敏感信息审计：扫描仓库中疑似硬编码的 API key、密码、token。

用法（仓库根）：python tools/audit_secrets.py
只报告「文件 + 行号 + 匹配类型」，绝不输出密钥内容。
退出码：0 = 无发现；1 = 发现疑似硬编码。
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "node_modules", "dist", ".venv", "__pycache__", ".workbuddy", "textbook_cache"}
SKIP_FILES = {"package-lock.json", ".env.example"}
# 允许的占位符/示例值（.env.example 中人工填写）
ALLOWED = {"your_", "example", "xxxx", "<", "changeme", "TODO", "xxx"}

PATTERNS = [
    ("sk-[A-Za-z0-9_-]{16,}", "openai_style_key"),
    (r"(api[_-]?key|apikey|secret|token|password|passwd)\s*[:=]\s*[\"'][^\"']{8,}[\"']", "credential_assignment"),
    (r"Bearer\s+[A-Za-z0-9._-]{20,}", "bearer_token"),
]


def audit() -> list[dict]:
    findings: list[dict] = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        if path.name in SKIP_FILES:
            continue
        if path.suffix not in {".py", ".ts", ".tsx", ".js", ".json", ".yaml", ".yml", ".env", ".toml", ".md"}:
            continue
        try:
            lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        for lineno, line in enumerate(lines, 1):
            for pattern, kind in PATTERNS:
                for m in re.finditer(pattern, line, re.IGNORECASE):
                    value = m.group(0)
                    if any(ok in value.lower() for ok in ALLOWED):
                        continue
                    findings.append({"file": str(rel), "line": lineno, "kind": kind})
    return findings


def main() -> int:
    findings = audit()
    if not findings:
        print("OK：未发现疑似硬编码密钥。")
        return 0
    for f in findings:
        print(f"[{f['kind']}] {f['file']}:{f['line']}")
    print(f"\n发现 {len(findings)} 处疑似硬编码敏感信息（值未输出）。")
    return 1


if __name__ == "__main__":
    sys.exit(main())
