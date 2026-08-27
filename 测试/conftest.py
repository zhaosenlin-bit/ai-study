# -*- coding: utf-8 -*-
"""pytest 全局配置:让 测试/api 与 测试/agent 能导入仓库根与 服务/api。

运行方式(仓库根):
    .venv/Scripts/python.exe -m pytest tests -v
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for p in (str(ROOT), str(ROOT / "services" / "api")):
    if p not in sys.path:
        sys.path.insert(0, p)