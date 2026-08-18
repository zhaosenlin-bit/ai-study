# 角色 A 执行文档：Agent 后端与接口负责人

分支：`feature/agent-core`  
主责目录：`services/api/`、`services/agent/`、`packages/contracts/`、`docs/api/`  
目标：让整个项目不是“聊天套壳”，而是有可展示的 Agent 状态机、工具调用、记忆和自适应路径。

## 1. 你负责什么

1. 搭建 FastAPI 后端骨架。
2. 维护 OpenAPI 接口契约。
3. 实现 LangGraph/Dify Agent 工作流。
4. 统一学生画像、错题、学习路径、复习任务的数据结构。
5. 给三科模块提供工具调用接口。
6. 给前端提供 mock 和真实 API。
7. 负责 Docker Compose 或一键启动脚本。

## 2. 你的分支和目录

```bash
git checkout develop
git pull origin develop
git checkout -b feature/agent-core
```

目录边界：

```text
services/api/          # FastAPI app、routers、schemas、dependencies
services/agent/        # LangGraph graph、nodes、tools、memory
packages/contracts/    # 共享类型、OpenAPI 生成物
docs/api/              # 接口契约文档
tests/api/             # 接口测试
tests/agent/           # Agent 单元测试
```

不要直接改三科题库和前端页面。如必须修改，先提 issue。

## 3. Agent 工作流

MVP 工作流必须包含以下节点：

```text
load_profile
  -> diagnose_student
  -> update_mastery
  -> plan_learning_path
  -> tutor_with_scaffolding
  -> record_mistake
  -> schedule_review
  -> reflect_and_adjust
```

每个节点都要能在日志中看到输入和输出，路演时用于证明 Agent 具备规划、记忆、工具调用能力。

## 4. 必做接口

接口以 `docs/api/openapi-contract-v0.yaml` 为准。

优先实现：

1. `POST /api/v1/diagnosis/start`
2. `POST /api/v1/diagnosis/submit`
3. `GET /api/v1/students/{student_id}/profile`
4. `GET /api/v1/students/{student_id}/path`
5. `POST /api/v1/agent/chat`
6. `GET /api/v1/students/{student_id}/mistakes`
7. `POST /api/v1/review/next`
8. `GET /api/v1/reports/parent/{student_id}`

## 5. 数据模型

你负责把以下模型定义为 Pydantic Schema：

- `StudentProfile`
- `KnowledgePoint`
- `Question`
- `DiagnosisSession`
- `AnswerSubmission`
- `MistakeRecord`
- `LearningPath`
- `TutorMessage`
- `ReviewItem`
- `ParentReport`

字段变更必须同步给角色 E 和对应学科负责人。

## 6. 工具接口

Agent 调用三科模块时，只能通过统一工具函数：

```text
search_knowledge_point(subject, query, grade)
get_diagnosis_questions(subject, grade, count)
grade_answer(question_id, answer)
get_scaffold_hint(question_id, answer, hint_level)
recommend_next_tasks(student_id, subject)
```

这样 B/C/D 可以并行维护三科数据，不需要理解 Agent 内部细节。

## 7. 验收标准

你的 PR 合并前必须满足：

- Swagger/OpenAPI 能打开。
- 所有核心接口有 mock 返回。
- 至少一条学生数据能跑完“诊断 -> 路径 -> 对话 -> 错题 -> 反思”。
- Agent 日志能看到节点流转。
- 不暴露 API Key。
- 有最少 5 个接口测试。

## 8. 和其他人的协作点

- B/C/D 给你题库、知识点、Prompt，你提供统一加载格式。
- E 需要稳定字段，你不能私下改接口。
- 每天 22:00 前合并 `develop`，优先解决接口冲突。

## 9. 提交示例

```bash
git add services/api services/agent packages/contracts docs/api tests
git commit -m "feat(agent): add diagnosis workflow and profile schema"
git push -u origin feature/agent-core
```
