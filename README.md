# ai-study 三科自适应伴学 Agent

2026 iFLYTEK AI 开发者大赛「自适应学习路径决策与伴学」参赛项目仓库。

本仓库采用五人并行开发模式，围绕小学语文、数学、英语三科，构建一个具备学情诊断、路径规划、实时干预、长期记忆与反思能力的 AI 伴学智能体。

当前文档状态：`v0.3 课前讨论版`。今晚课堂会先听每位同学的创意方案，老师确认最终方向后再升级为 `v0.4 方案整合版` 或 `v1.0 开发基线版`。

## 先看这三件事

1. 每位同学不是只领取自己的角色文档，而是先读总工程文档和协作规则，再读自己的分工文档。
2. 所有代码都从 GitHub 拉分支开发，最终通过 PR 汇入 `develop`，老师验收后再合并到 `main`。
3. 课前版本会留出改动口子，今晚确认学生方案后，需求、分工、接口、验收标准会统一升级版本。

## 必读文档

全组共读：

- [总 PRD、架构与协作规则](docs/00-master-prd-architecture-collaboration.md)
- [课堂展示讲义 Markdown 版](docs/01-classroom-student-handbook.md)
- [Word 投屏讲义](docs/presentation/ai-study-课堂展示讲义-v0.3.docx)
- [技术栈与架构学习选择指南](docs/02-tech-stack-and-architecture-learning-guide.md)
- [文档领取、版本升级与课后确认流程](docs/03-document-reading-and-versioning-guide.md)
- [Git 协作规范](CONTRIBUTING.md)
- [OpenAPI 接口契约草案](docs/api/openapi-contract-v0.yaml)
- [讯飞星火/语音 Key 获取与环境变量](docs/setup/iflytek-keys.md)

角色领取：

- [A-E 角色分工确认看板](docs/roles/00-role-assignment-board.md)
- [角色 A：Agent 后端与接口负责人](docs/roles/01-role-a-agent-backend.md)
- [角色 B：数学模块负责人](docs/roles/02-role-b-math.md)
- [角色 C：语文模块负责人](docs/roles/03-role-c-chinese.md)
- [角色 D：英语模块负责人](docs/roles/04-role-d-english.md)
- [角色 E：前端体验、联调与演示负责人](docs/roles/05-role-e-frontend-integration.md)

今晚创意方案：

- [学生创意方案模板](docs/proposals/student-proposal-template.md)
- [课后最终方案确认模板](docs/proposals/final-decision-template.md)

## 分支

- `main`: 最终稳定版本，只由负责人合并。
- `develop`: 每日集成分支。
- `feature/agent-core`: 角色 A 开发。
- `feature/subject-math`: 角色 B 开发。
- `feature/subject-chinese`: 角色 C 开发。
- `feature/subject-english`: 角色 D 开发。
- `feature/web-integration-demo`: 角色 E 开发。

所有同学先阅读全组共读文档，再从 `develop` 拉自己的功能分支开发。任何接口、目录、字段变化，先更新文档和 OpenAPI，再写代码。


---

## 2026-08-20 项目整合

新增 1 份检查报告 + 6 份学生创意方案（星图探险家系列）。

| 文件 | 路径 | 说明 |
| --- | --- | --- |
| 项目检查报告 | `docs/检查报告_项目现状与建议.md` | localhost:5174 + 仓库现状评估，5 强项 5 弱项 + W3/W4 行动项 |
| 创意方案索引 | `docs/proposals/student-proposals/README.md` | 星图探险家方案的接入说明 |
| 星图探险家 PRD | `docs/proposals/student-proposals/role-X-星图探险家-PRD.md` | 13 章产品需求 |
| 星图探险家 执行 | `docs/proposals/student-proposals/role-X-星图探险家-执行文档.md` | 4 周 WBS + OpenAPI + Prompt |
| 星图探险家 团队分工 | `docs/proposals/student-proposals/role-X-星图探险家-团队分工与降级.md` | 4/3/2/1 人降级方案 |
| 星图探险家 灵感 | `docs/proposals/student-proposals/role-X-星图探险家-灵感散文.md` | 「当 AI 学会陪一个孩子做火星探测器」 |
| v1.0 基线 | `docs/proposals/student-proposals/v1.0-团队协作方案基线.docx` | 原始 4 人 v1.0 文档，作为对比基线 |

---

## 2026-08-21 MVP 集成版（可完整跑通）

五条分支代码已整合：角色 A 后端（FastAPI + LangGraph）、角色 B 数学模块、角色 D 英语数据、角色 C 语文数据补齐、角色 E 前端，三科真实数据入库，前后端全链路跑通。

### 一键启动

**1) 后端（FastAPI,端口 8000）**

```bash
# 首次安装依赖
python -m venv .venv && .venv/Scripts/pip install -r services/api/requirements.txt
# 启动（从 services/api 目录）
cd services/api
../..//.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
# 打开 Swagger 文档: http://localhost:8000/docs
```

**2) 前端（React + Vite,端口 5174）**

```bash
cd apps/web
npm install
# 真实 API 模式（默认 mock;false 时前端请求 http://localhost:8000）
VITE_USE_MOCK=false npm run dev
# 打开: http://localhost:5174
```

**3) 一键验收**

```bash
# 后端启动后,运行全链路验证(26 项检查:8 个核心接口 + OpenAPI)
.venv/Scripts/python.exe tools/verify_mvp.py
# 运行全部单元/接口测试(34 项)
.venv/Scripts/python.exe -m pytest tests -v
```

### 三科数据（data/）

| 学科 | 知识图谱 | 题库 | Prompt |
| --- | --- | --- | --- |
| 数学 | 32 节点（3-6 年级,含前置依赖） | 72 题（42 诊断 + 20 巩固 + 10 复习） | 3 套 |
| 语文 | 24 节点（3-6 年级） | 30 题（古诗/阅读/识字/表达） | 3 套 |
| 英语 | 52 节点（3-6 年级） | 100 题 + 语音清单 | 3 套 |

数据生成脚本见 `tools/gen_math_data.py`、`tools/gen_chinese_data.py`；代码合集原始文档归档于 `docs/contributions/`。

### 模型网关

`MODEL_PROVIDER` 支持 `mock | spark | deepseek | qwen | minimax`，复制 `.env.example` 为 `.env` 并填入对应 Key；未配置 Key 自动回退 mock，不影响演示。

详见 `docs/CHANGELOG.md` 与 `docs/检查报告_项目现状与建议.md`。
