"""FastAPI 应用入口：注册路由、health 检查、启动时初始化 SQLite。"""

import sys
from contextlib import asynccontextmanager
from pathlib import Path

# 让 services/api 能导入仓库根目录下的 packages/contracts
ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import 数据库
from app.routers import 智能体, 认证, 课程, 诊断, 学习, 用户信息, 报告, 复习, 学生, 学习时长


@asynccontextmanager
async def lifespan(_: FastAPI):
    数据库.init_db()
    yield


app = FastAPI(
    title="ai-study Adaptive Tutor API",
    version="0.2.0",
    description="三科自适应伴学 Agent MVP 接口。OpenAPI 契约见 docs/api/openapi-contract-v0.yaml",
    lifespan=lifespan,
)

# 前端（Vite dev server）跨域访问支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (诊断.router, 学生.router, 智能体.router, 复习.router, 报告.router, 认证.router, 用户信息.router, 学习.router, 课程.router, 学习时长.router):
    app.include_router(router)


@app.get("/api/v1/health", summary="Health check", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}