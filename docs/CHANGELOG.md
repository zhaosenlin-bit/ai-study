# ai-study 文档版本记录

## v0.4 MVP 集成版

日期：2026-08-21

用途：五条分支代码首次完整集成，前端 + 后端 + 三科真实数据全链路跑通，作为 9 月 9 日初赛提交的可运行基线。

变更：

- 角色 A：20 个 Python 文件（FastAPI 8 接口 + LangGraph 8 节点 + 模型网关 + SQLite）从 `docs/contributions/` 代码合集还原到 `packages/contracts`、`services/agent`、`services/api`、`tests`。
- 角色 B：6 个 Python 文件（数据加载器/错因/路径/Prompt）还原到 `packages/subject_math`；数学数据补齐（32 节点 + 72 题 + 3 套 Prompt）。
- 角色 C：语文数据补齐（24 节点 + 30 题 + 3 套 Prompt）。
- 角色 D：英语分支合并（52 节点 + 100 题 + 3 套 Prompt + 词卡花园方案）。
- 角色 E：前端 7 页面保持；`VITE_USE_MOCK=false` 切真实后端联调通过。
- 工具层 `services/agent/tools.py` 改为读取 `data/` 真实 JSON；诊断按学生年级抽题。
- 测试：34 项全部通过（接口 9 / Agent 11 / 数学 14）；`tools/verify_mvp.py` 全链路 26 项检查通过。
- 文档：README 增加一键启动与验收说明；代码合集归档到 `docs/contributions/`。

## v0.3 课前讨论版

日期：2026-08-18

用途：用于今晚课堂投屏、学生理解项目、A-E 分工确认和创意方案收集。

已确认：

- 项目名：`ai-study`。
- 前端：`React + Vite + TypeScript`。
- 三科：语文、数学、英语。
- 体验方向：AI 精灵 + 左右边缘功能按钮 + 沉浸式学习空间。
- 模型策略：不写死一家，支持 `spark | deepseek | qwen | minimax | mock` 可切换。

待确认：

- A-E 对应的学生姓名。
- AI 精灵名称和性格。
- 最终 MVP 年级范围。
- 学生创意方案哪些采纳、哪些延期、哪些暂不做。
- 最终接口字段和页面优先级。

下一步：

- 课堂后整理 `docs/proposals/final-decision.md`。
- 根据老师确认结果升级到 `v0.4 方案整合版` 或 `v1.0 开发基线版`。


## 2026-08-20 项目检查（Codex）

- 新增 `docs/检查报告_项目现状与建议.md`
- 评估范围：localhost:5174（Vite 前端运行态）+ 仓库 develop 分支
- 主要结论：前端 7 页全部跑通，Mock 数据成熟，处于可路演状态；后端 API/Agent、三科数据、PPT、人设文档为 P0 缺口
- 详见 `docs/检查报告_项目现状与建议.md`


## 2026-08-20 项目整合（Codex）

新增学生创意方案"星图探险家"系列 6 份 + 1 份 README 索引：

- `docs/proposals/student-proposals/README.md`（索引）
- `docs/proposals/student-proposals/role-X-星图探险家-PRD.md`（PRD）
- `docs/proposals/student-proposals/role-X-星图探险家-执行文档.md`（执行文档）
- `docs/proposals/student-proposals/role-X-星图探险家-团队分工与降级.md`（团队分工）
- `docs/proposals/student-proposals/role-X-星图探险家-灵感散文.md`（灵感散文）
- `docs/proposals/student-proposals/v1.0-团队协作方案基线.docx`（v1.0 基线）

ROOT `README.md` 同步更新了"2026-08-20 项目整合"章节。

星图探险家方案是 v1.0 基线文档的"创意升级版"——保留现有 v0.3 三科并列结构，叠加"跨学科主题项目 + AI 同伴人格化 + 学习星图"三个差异化亮点。
