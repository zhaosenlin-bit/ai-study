# Git 协作规范

本规范用于保证五个人开发的代码最后能汇成一个完整 Demo。

## 开发前先确认

开始写代码前，先读完：

- `README.md`
- `docs/00-master-prd-architecture-collaboration.md`
- `docs/01-classroom-student-handbook.md`
- `docs/03-document-reading-and-versioning-guide.md`
- 自己的角色文档

如果老师课后确认了新方案，先更新文档和 OpenAPI，再改代码。

## 第一次拉取

```bash
git clone https://github.com/zhaosenlin-bit/ai-study.git
cd ai-study
git checkout -b develop origin/main
git push -u origin develop
```

如果 `develop` 已存在：

```bash
git clone https://github.com/zhaosenlin-bit/ai-study.git
cd ai-study
git checkout develop
git pull origin develop
```

## 每个人创建自己的分支

```bash
git checkout develop
git pull origin develop
git checkout -b feature/agent-core
```

分支对应关系：

| 角色 | 分支 | 主责目录 |
| --- | --- | --- |
| A | `feature/agent-core` | `services/api/`, `services/agent/`, `packages/contracts/` |
| B | `feature/subject-math` | `data/knowledge_graph/math/`, `data/question_bank/math/`, `prompts/math/` |
| C | `feature/subject-chinese` | `data/knowledge_graph/chinese/`, `data/question_bank/chinese/`, `prompts/chinese/` |
| D | `feature/subject-english` | `data/knowledge_graph/english/`, `data/question_bank/english/`, `prompts/english/` |
| E | `feature/web-integration-demo` | `apps/web/`, `docs/demo/`, `tests/e2e/` |

## 每天开发流程

```bash
git status
git pull origin develop
git add .
git commit -m "feat(agent): add diagnosis workflow"
git push -u origin feature/agent-core
```

提交信息格式：

- `feat(scope): 新增功能`
- `fix(scope): 修复问题`
- `docs(scope): 更新文档`
- `test(scope): 增加测试`
- `chore(scope): 工程配置`

常用 scope：`agent`、`api`、`math`、`chinese`、`english`、`web`、`data`、`demo`。

## Pull Request 规则

1. 所有 PR 合并到 `develop`，不能直接合并到 `main`。
2. 每个 PR 至少找 1 名其他同学 Review。
3. 改接口前必须先改 `docs/api/openapi-contract-v0.yaml`，并在群里同步。
4. 每天 22:00 前尽量提交一次可运行进度，避免最后一天集中冲突。
5. `main` 只在总负责人验收完整 Demo 后合并。

## 冲突处理

- API 冲突：以 `docs/api/openapi-contract-v0.yaml` 为准。
- 数据模型冲突：以角色 A 的 Pydantic/Schema 为准。
- 学科内容冲突：各学科负责人有最终解释权。
- 前端字段冲突：角色 E 先提 issue，角色 A 在接口契约中统一。

## 合并前自查

- 能本地启动自己负责的模块。
- 没有提交 `.env`、密钥、临时压缩包、大型视频。
- README 或角色文档已同步变更。
- 版本号和文档入口已同步变更。
- 测试数据不是空壳，至少能支撑一轮演示。
- PR 描述写清楚做了什么、怎么验收、还缺什么。
