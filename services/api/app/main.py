"""FastAPI 应用入口：注册路由、health 检查、启动时初始化 SQLite。"""

import sys
from contextlib import asynccontextmanager
from pathlib import Path

# 让 services/api 能导入仓库根目录下的 packages/contracts
ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi import FastAPI

from app import db
from app.routers import agent, diagnosis, reports, review, students


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.init_db()
    yield


app = FastAPI(
    title="ai-study Adaptive Tutor API",
    version="0.2.0",
    description="三科自适应伴学 Agent MVP 接口。OpenAPI 契约见 docs/api/openapi-contract-v0.yaml",
    lifespan=lifespan,
)

for router in (diagnosis.router, students.router, agent.router, review.router, reports.router):
    app.include_router(router)


@app.get("/api/v1/health", summary="Health check", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
