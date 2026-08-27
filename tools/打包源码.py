"""打包项目源码为 zip（排除依赖/构建产物/缓存）。"""
import os
import zipfile

ROOT = "."
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ai-study-源码包.zip")
EXCLUDE_DIRS = {".git", "node_modules", ".venv", ".workbuddy", "__pycache__", "dist", "build", ".vite", "_legacy_backup"}
EXCLUDE_EXTS = {".pyc", ".pyo", ".map"}
EXCLUDE_FILES = {"ai-study-源码包.zip"}

count = 0
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for f in filenames:
            if f in EXCLUDE_FILES or os.path.splitext(f)[1] in EXCLUDE_EXTS:
                continue
            full = os.path.join(dirpath, f)
            z.write(full, os.path.relpath(full, ROOT))
            count += 1
print(f"打包完成: {count} 个文件, {os.path.getsize(OUT)/1024/1024:.1f} MB -> {OUT}")