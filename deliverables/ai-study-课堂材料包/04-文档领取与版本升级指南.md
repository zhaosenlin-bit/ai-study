# ai-study 文档领取、版本升级与课后确认流程

版本：v0.3 课前讨论版  
日期：2026-08-18  
用途：让每位同学知道该读哪些文档、该领哪个任务、怎么提交方案、老师课后怎么把大家的方案升级成最终开发版本。

## 1. 先用大白话理解

五个人一起做项目，最怕的不是代码少，而是每个人心里的项目不一样。

可以把文档想成三层：

1. 总工程文档：告诉大家“我们到底要造什么”。
2. 协作规则文档：告诉大家“怎么一起造，代码怎么合起来”。
3. 角色执行文档：告诉每个人“你这一块先做什么，做到什么算合格”。

所以领取任务不是只拿自己的角色文档。每位同学都要先看共同规则，再看自己的分工。

## 2. 当前版本状态

当前版本是 `v0.3 课前讨论版`，意思是：

- 项目名已经固定为 `ai-study`。
- 前端统一使用 `React + Vite + TypeScript`。
- 角色暂时用 A-E 表示，姓名由老师课上确认。
- 三科方向已经确定为语文、数学、英语。
- UI 方向暂定为 AI 精灵 + 左右边缘功能按钮 + 沉浸式学习空间。
- 模型不写死某一家，支持 `spark | deepseek | qwen | minimax | mock` 可切换。
- 学生今晚的创意方案还没有纳入最终版本。

这份版本的作用是让大家课上能讨论、课后能启动，不代表所有需求已经锁死。

## 3. 每位同学必须先读哪些文档

每位同学不管分到 A、B、C、D、E，都必须先读下面这些：

| 顺序 | 文档 | 你要看懂什么 |
| --- | --- | --- |
| 1 | `README.md` | 仓库入口、文档顺序、分支名称 |
| 2 | `docs/00-master-prd-architecture-collaboration.md` | 产品目标、架构、评分点、总验收 |
| 3 | `docs/01-classroom-student-handbook.md` | 老师课堂讲解口径和项目整体画面 |
| 4 | `docs/02-tech-stack-and-architecture-learning-guide.md` | 为什么这么选技术栈，以后怎么自己判断 |
| 5 | `docs/03-document-reading-and-versioning-guide.md` | 领文档、交方案、改版本的规则 |
| 6 | `CONTRIBUTING.md` | Git 分支、提交、PR、冲突处理 |
| 7 | `docs/api/openapi-contract-v0.yaml` | 前后端共同接口合同 |

如果你的任务涉及模型或语音，再读：

- `docs/setup/iflytek-keys.md`

## 4. 每个角色额外领取哪个文档

| 角色 | 必领角色文档 | 额外重点 |
| --- | --- | --- |
| A | `docs/roles/01-role-a-agent-backend.md` | 还要重点看 OpenAPI，因为你负责接口统一 |
| B | `docs/roles/02-role-b-math.md` | 还要重点看题库 JSON 和知识点格式 |
| C | `docs/roles/03-role-c-chinese.md` | 还要重点看语文题型、Prompt 和知识点格式 |
| D | `docs/roles/04-role-d-english.md` | 还要重点看复习调度和英语听说/词汇规则 |
| E | `docs/roles/05-role-e-frontend-integration.md` | 还要重点看 UI 方向、接口契约和演示脚本 |

`docs/roles/00-role-assignment-board.md` 是老师课堂确认角色用的看板，所有人都要看。

## 5. 领取任务时怎么确认

老师确认 A-E 姓名后，每位同学在群里发一条确认消息：

```text
我是角色 X，负责 ______。
我已经阅读：README、总 PRD、课堂讲义、技术栈指南、文档领取指南、Git 规范、OpenAPI、我的角色文档。
我的分支是 ______。
我今晚先提交 ______。
我需要 ______ 同学配合 ______。
我目前最担心的风险是 ______。
```

这条消息不是形式，它能让老师马上看出谁还没理解自己的边界。

## 6. 今晚每位同学的创意方案怎么提交

每位同学用这个模板写：

- `docs/proposals/student-proposal-template.md`

建议文件名：

```text
docs/proposals/student-proposals/role-X-姓名-创意名称.md
```

如果还没有确认姓名，可以先写：

```text
docs/proposals/student-proposals/role-X-pending-idea.md
```

每个方案控制在 1 页以内，重点说清楚：

1. 这个创意解决什么真实学习问题。
2. 它接入项目闭环的哪一环。
3. 两周内能不能做出可演示版本。
4. 需要改哪些接口、数据、页面或 Prompt。
5. 哪些部分必须做，哪些可以放到后续版本。

## 7. 老师课后怎么把方案升级成最终版本

今晚看完大家方案后，不要直接让所有人各做各的。建议按这个顺序升级：

1. 老师把每个方案放进 `docs/proposals/student-proposals/`。
2. 老师或总负责人复制 `docs/proposals/final-decision-template.md`，整理成 `docs/proposals/final-decision.md`。
3. 每个创意标记为 `采纳`、`延期`、`暂不做`。
4. 被采纳的创意必须写清楚接入哪个角色、哪个页面、哪个接口、哪个验收点。
5. 更新 `docs/00-master-prd-architecture-collaboration.md`。
6. 更新 A-E 角色文档。
7. 如果接口变了，先更新 `docs/api/openapi-contract-v0.yaml`。
8. 重新生成 `docs/presentation/ai-study-课堂展示讲义-v0.3.docx` 或升级输出为新版本 DOCX。
9. 在 `docs/CHANGELOG.md` 记录版本变化。

这样做的目的很简单：创意可以变，但大家看的“最终规则”只能有一套。

## 8. 版本怎么升级

| 版本 | 使用时机 | 意义 |
| --- | --- | --- |
| v0.3 课前讨论版 | 2026-08-18 上课前 | 给老师讲课、学生理解项目、提交创意 |
| v0.4 方案整合版 | 老师看完学生方案后 | 记录哪些创意采纳、延期、暂不做 |
| v1.0 开发基线版 | 课堂确认最终开发方向后 | 作为学生正式开发和验收依据 |
| v1.1+ 迭代版 | 开发过程中需求微调 | 只改已确认的小范围内容 |

一旦进入 `v1.0`，不能私下改需求。任何人想改接口、目录、数据结构或核心页面，都要提 issue 或 PR。

## 9. 改文档的顺序

如果老师今晚确认新方案，按这个顺序改：

1. 先改 `docs/proposals/final-decision.md`，记录为什么采纳或不采纳。
2. 再改 `docs/00-master-prd-architecture-collaboration.md`，保证总目标更新。
3. 再改 A-E 角色文档，让每个人知道自己的任务变化。
4. 如果涉及接口，再改 `docs/api/openapi-contract-v0.yaml`。
5. 如果涉及 Git 或提交规则，再改 `CONTRIBUTING.md`。
6. 最后改课堂讲义和 DOCX，方便继续投屏讲解。
7. 在 `docs/CHANGELOG.md` 写一条版本记录。

不要只改角色文档，不改总文档。那样最后合并代码时会出现理解冲突。

## 10. 开发前的最后自查

每位同学开分支写代码前，先确认：

- 我知道自己是 A-E 中哪个角色。
- 我知道自己应该读哪些全组文档。
- 我知道自己的主责目录，尽量不碰别人目录。
- 我知道接口以 OpenAPI 为准。
- 我知道今天提交的最小成果是什么。
- 我知道如果需求变化，应该先改文档再改代码。

这六条都清楚，再开始写代码。
