# ai-study 文档版本记录

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
