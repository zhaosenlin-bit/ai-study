"""灵宝 AI 伴学 后端扩展

挂载 ai-study-repo 现有路由 (/api/v1/*) + 新增:
- /api/children       多孩子档案管理
- /api/plan           学习计划生成
- /api/learn          讲解/练习/答题
- /api/tts            Kokoro TTS

启动: uvicorn app.main:app --reload --port 8000
"""
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# 引入 ai-study-repo 路径
ROOT_REPO = Path(__file__).resolve().parents[4] / "ai-study-repo"
ROOT_REPO_API = ROOT_REPO / "services" / "api"
if str(ROOT_REPO_API) not in sys.path:
    sys.path.insert(0, str(ROOT_REPO_API))
if str(ROOT_REPO) not in sys.path:
    sys.path.insert(0, str(ROOT_REPO))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 现有 ai-study-repo 数据库和路由(通过 sys.path 让其作为 'app' 包加载)
sys.path.insert(0, str(ROOT_REPO_API))
import app.db as repo_db  # noqa: E402
from app.routers import agent, diagnosis, reports, review, students  # noqa: E402

# 新路由
from lingbao_app.routers import children, plan, learn, tts, diagnosis as diagnosis_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    repo_db.init_db()
    print("[lingbao] backend ready on http://localhost:8000")
    yield


app = FastAPI(
    title="灵宝 AI 伴学 API",
    version="1.0.0",
    description="移动端 AI 学习伴侣后端:学情诊断 + 个性化计划 + 即时讲解 + 多孩子档案",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载现有 ai-study-repo 路由
for router in (diagnosis.router, students.router, agent.router, review.router, reports.router):
    app.include_router(router)

# 新路由
app.include_router(children.router)
app.include_router(plan.router)
app.include_router(learn.router)
app.include_router(tts.router)
app.include_router(diagnosis_router.router)


@app.get("/api/health", summary="Health check", tags=["system"])
def health():
    return {"status": "ok", "service": "lingbao", "version": "1.0.0"}


@app.get("/api/textbook-versions", summary="教材版本元数据", tags=["system"])
def textbook_versions():
    return {
        "chinese": {"version": "统编版", "publisher": "人民教育出版社", "stages": ["小学", "初中"]},
        "math":    {"version": "北师大版", "publisher": "北京师范大学出版社", "stages": ["小学", "初中"]},
        "english": {"version": "人教版(PEP)", "publisher": "人民教育出版社", "stages": ["小学", "初中"]},
    }