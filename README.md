# ai-study 三科自适应伴学 Agent

2026 iFLYTEK AI 开发者大赛「自适应学习路径决策与伴学」参赛项目仓库。

本仓库采用五人并行开发模式，围绕小学语文、数学、英语三科，构建一个具备学情诊断、路径规划、实时干预、长期记忆与反思能力的 AI 伴学智能体。

## 必读文档

- [总 PRD、架构与协作规则](docs/00-master-prd-architecture-collaboration.md)
- [课堂展示与学生执行手册](docs/01-classroom-student-handbook.md)
- [Word 展示文档](docs/presentation/ai-study-课堂展示与学生执行手册.docx)
- [角色 A：Agent 后端与接口负责人](docs/roles/01-role-a-agent-backend.md)
- [A-E 角色分工确认看板](docs/roles/00-role-assignment-board.md)
- [角色 B：数学模块负责人](docs/roles/02-role-b-math.md)
- [角色 C：语文模块负责人](docs/roles/03-role-c-chinese.md)
- [角色 D：英语模块负责人](docs/roles/04-role-d-english.md)
- [角色 E：前端体验、联调与演示负责人](docs/roles/05-role-e-frontend-integration.md)
- [OpenAPI 接口契约草案](docs/api/openapi-contract-v0.yaml)
- [讯飞星火/语音 Key 获取与环境变量](docs/setup/iflytek-keys.md)
- [Git 协作规范](CONTRIBUTING.md)

## 分支

- `main`: 最终稳定版本，只由负责人合并。
- `develop`: 每日集成分支。
- `feature/agent-core`: 角色 A 开发。
- `feature/subject-math`: 角色 B 开发。
- `feature/subject-chinese`: 角色 C 开发。
- `feature/subject-english`: 角色 D 开发。
- `feature/web-integration-demo`: 角色 E 开发。

所有同学先阅读总文档和自己的角色文档，再从 `develop` 拉自己的功能分支开发。
