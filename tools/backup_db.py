"""SQLite 数据库备份：复制 ai_study.db 到 data/backups/（带时间戳）。

用法（仓库根）：python tools/backup_db.py
验收项 D-3：备份任务存在且可执行；恢复 = 将备份文件拷回 DB_PATH。
"""
from __future__ import annotations

import shutil
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services" / "api"))

from app import db  # noqa: E402


def backup() -> Path:
    src = db.DB_PATH
    if not src.exists():
        raise FileNotFoundError(f"数据库不存在：{src}（先运行 init_db）")
    backup_dir = ROOT / "data" / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    dst = backup_dir / f"ai_study_{ts}.db"
    shutil.copy2(src, dst)
    return dst


def main() -> int:
    try:
        dst = backup()
    except FileNotFoundError as exc:
        print(str(exc))
        return 1
    print(f"备份成功：{dst}（{dst.stat().st_size} 字节）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
