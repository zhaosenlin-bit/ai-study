# ai-study 项目长期记忆

## 项目背景
- 2026 iFLYTEK AI 开发者大赛「自适应学习路径决策与伴学」参赛项目，五人并行开发
- 仓库：https://github.com/zhaosenlin-bit/ai-study.git
- 文档已升级 v0.4（2026-08-21 集成版），以最新文档为准
- 用户负责**角色 A：Agent 后端与接口**（分支 feature/agent-core）
- 2026-08-21 远程已整合为 MVP 集成版 8355f5a（Codex 集成，34 测试通过），本地三分支（agent-core/develop/main）均已对齐该版本

## 关键约定（重要）
1. **git 分支方案**：本机 git 无法持久化嵌套 ref 目录（refs/heads/feature/），`git update-ref`/`commit` 后目录会被外部清除（2026-08-20 再次验证，添加 Defender 排除项后依然失败，原因未完全定位，不要再花时间排查）。**解决方案：本地用单级分支 `agent-core` 开发**（已稳定验证 3 次提交），推送时 `git push origin agent-core:feature/agent-core` 映射为规范分支名。develop 分支从 main 创建（本地），未推送远程。
2. git 提交身份：本地配置 role-a / role-a@ai-study.local（占位，用户可自行改真实身份）
3. 目录结构：services/api（FastAPI）、services/agent（LangGraph，待实现）、packages/contracts（Pydantic 模型）
4. 接口契约：docs/api/openapi-contract-v0.yaml 为准，改接口先改契约
5. 提交规范：feat(scope): 描述；PR 合到 develop 不能直合 main
6. 主责目录：services/api、services/agent、packages/contracts、docs/api、tests/api、tests/agent

## 技术方案
- FastAPI + Pydantic + SQLite（services/api/app/db.py，数据文件 services/api/data/ai_study.db 已被 gitignore 忽略）
- 核心闭环服务：services/api/app/services/tutor.py（诊断评分/画像/路径/错题/复习/报告）
- Agent 工作流：services/agent/nodes.py（LangGraph StateGraph，8 节点顺序流转，node_logs 记录输入输出）+ services/agent/tools.py（5 工具 + 题库/知识点图谱）+ services/agent/model_gateway.py（模型网关）
- 模型网关环境变量：MODEL_PROVIDER 或 LLM_PROVIDER = mock|spark|deepseek|qwen|minimax；<PROVIDER>_API_KEY/_BASE_URL 未配置自动回退 mock（.env.example 已更新）
- agent/chat 走工作流：带 question_id 判题（更新掌握度/记录错题/排复习），tool_trace 返回节点流转日志
- 演示学生：stu_demo_001 小明（四年级）
- Agent 工作流 8 节点：load_profile→diagnose→update_mastery→plan_learning_path→tutor_with_scaffolding→record_mistake→schedule_review→reflect_and_adjust

## 协作注意
- 修改 packages/contracts 字段需同步角色 E 和学科负责人
- 每日 22:00 前合并 develop
- 里程碑：9/9 初赛截止
