# 角色 A · 架构/后端 执行手册

**小学全科(语数英综合) AI 伴学 Agent —— 我的专属手册**

2026 iFLYTEK AI 开发者大赛 · Adaptive-LPDS 赛道 · 配套《我的方案 v4.0》· 更新 2026-08-28（第 3 周 Day 4） · Git 分支 feature/agent-core

## 角色 A · 架构/后端 执行手册

小学全科(语数英综合) AI 伴学 Agent —— 我的专属手册

2026 iFLYTEK AI 开发者大赛 · Adaptive-LPDS 赛道 · 配套《我的方案 v4.0》· 更新 2026-08-28（第 3 周 Day 4） · Git 分支 feature/agent-core

> **一句话定位**：我是 Agent 架构师/后端核心：四大能力 Service + LangGraph 编排 + FastAPI 骨架 + Docker 部署，是全项目“接口宪法”的制定者。

## 一、我的角色卡

| 项目 | 内容 |
|---|---|
| 核心职责 | 学情诊断 / 路径规划 / 实时干预 / 记忆反思 四大 Service + Agent 编排（LangGraph 或 Dify） |
| 本周目标 | FastAPI 骨架 + Agent 接口契约 stub + LangGraph hello world |
| Git 分支 | feature/agent-core（PR 提到 dev，不直接提 main） |
| 主要对接 | B：数据模型以你的 Pydantic Schema 为准；C：API 以你的 OpenAPI 为准 |
| 评分贡献 | 智能体架构 30 分的主要责任；自适应策略 25 分与 B 共担 |

## 二、我的每周动作卡

| 我的每周 | 核心动作（含关键技术） | 产出 / 验收 |
|---|---|---|
| 周 1 | FastAPI 骨架（uvicorn + pydantic）；定义 /api/v1/agent/* 契约与 mock；跑通 LangGraph hello world | 骨架 + Swagger + stub；hello world 跑通 |
| 周 2 | 学情诊断 Service（出题→收答案→LLM 错因分析→更新画像）；路径规划 Service（知识图谱 BFS/优先队列） | 两大 Service + 单元测试通过 |
| 周 3 | 实时干预 Service（Socratic 引导）；记忆反思 Service（短期 buffer + 长期画像）；与 C 联调 | 四大 Service 全通；闭环可演示 |
| 周 4 | Docker Compose 一键启动 + README + 预答辩技术支持 | docker compose up 可跑；文档齐 |

## 三、我的验收（DoD）

| 时间 | 验收项 | 完成 |
|---|---|---|
| 周 1 | 骨架可起 + Swagger 有 4+ 路由 + LangGraph hello world 跑通 | □ |
| 周 2 | 诊断/路径 Service 单元测试通过（覆盖率以 ≥70% 为目标） | □ |
| 周 3 | 四大 Service 全通 + 与 C 联调“诊断→推荐→辅导→复盘”闭环可演示 | □ |
| 周 4 | docker compose up 一键起 + README + 证据包（工作流截图/日志） | □ |

## 四、关键技术速查（可直接复制）

### 4.1 API 契约示例（统一前缀 /api/v1）

| 接口 | 请求示例 | 响应要点 |
|---|---|---|
| POST /agent/diagnose | {"grade":4,"subject":"math"} | student_id、weak_points[]、mistakes[]、next_kp |
| GET /agent/path/{student_id} | — | path:[{kp_id, name, reason}] |
| POST /agent/chat | {"student_id":"...","message":"..."} | reply、role_switch、emotion_state |
| GET /student/{id}/profile | — | 画像 JSON（见数据模型约定） |
| GET /student/{id}/mistakes | — | 错题列表（含 error_type / next_review_at） |

### 4.2 LangGraph 工作流（四个节点）

| 节点 | 职责 | 输入 → 输出 |
|---|---|---|
| diagnose | 出题收答案 → LLM 错因分析 → 更新画像 | 题目集 → weak_points + mistakes |
| plan | 基于知识图谱找“前置已掌握 + 当前薄弱” | weak_points → 下节内容 + 讲解方式 |
| tutor | Socratic 引导式讲解，不直接给答案 | 题目 + 上下文 → 分步提示 |
| reflect | 5 轮对话后自评是否需要调整 | 对话记录 → 调整建议 |

状态对象：student_profile / chat_history / knowledge_path。记忆 = 短期对话 buffer + SQLite/Redis 长期画像。

### 4.3 FastAPI 骨架 & Docker

| 项目 | 要点 |
|---|---|
| 目录结构 | backend/app/{routers,services,models,core}；backend/tests |
| 依赖 | fastapi, uvicorn, pydantic, langgraph, httpx, pytest；数据库 sqlite3/redis |
| Docker | compose 服务：backend / frontend / chroma(可选) / neo4j(可选)；一键 docker compose up |
| 大模型封装 | llm.chat(messages, model="spark\|deepseek")；星火主 + DeepSeek 备；超时 + 重试 + 切换 |

### 4.4 单元测试要点

| 项 | 要求 |
|---|---|
| 覆盖 | diagnose 出题逻辑、错因分类、path 生成、reflect 判断 |
| 工具 | pytest + coverage；可加 GitHub Actions 自动跑 |
| 目标 | 覆盖率 ≥70%（提交硬要求） |

## 五、我的时间与风险

| 风险 | 我的动作 |
|---|---|
| LangGraph 学习曲线 | Day3 先跑 hello world，再基于官方例子改；每天最多花 1 小时学新框架 |
| 星火 API 限流 | 封装层留 model 切换口；本地用 mock 数据先测逻辑 |
| 接口变更 | 先改 OpenAPI 文档再改代码，群里同步后再合 |
