# -*- coding: utf-8 -*-
"""pytest 全局配置:让 测试/* 能导入仓库根、 服务/api 与 包。"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for p in (str(ROOT), str(ROOT / "服务" / "api"), str(ROOT / "包")):
    if p not in sys.path:
        sys.path.insert(0, p)
