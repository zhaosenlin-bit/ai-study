# 英语模块演示脚本（角色 D）

版本：v0.4 课前讨论版
用途：英语模块 1 轮完整演示（约 3 分 30 秒），供角色 E 汇总到总演示、录制 Demo 视频。
配套数据：`data/knowledge_graph/english/`（52 节点 / 354 词）、`data/question_bank/english/`（100 题，5 类题型）、`prompts/english/`（3 个 Prompt，已升级 v0.4）。

## 演示流程（诊断 → 错词 → 复习 → 纠错 → 情景对话 → 词卡花园 → 路径更新）

### 第 1 步：英语诊断（约 45 秒）

学生选择 3 年级 → 开始英语诊断，AI 精灵（`prompts/english/diagnose.md`）出 3 道题：

1. `english_q_0001` 词义识别：Which word means "红色"?（答对）
2. `english_q_0013` 拼写题：banana → 学生故意答成 `banna`（答错）
3. `english_q_0018` 星期顺序：What day comes after Monday?（答对）

诊断结论（YAML 输出，与 OpenAPI `DiagnosisResult` 对齐）：

```yaml
diagnosis:
  student_id: stu_demo_001
  weak_points:
    - knowledge_point_id: english_g3_fruits
      mastery: 0.2
      dominant_error_type: spelling_error
  mastery_updates:
    english_g3_fruits: 0.2
    english_g3_colors: 0.7
    english_g3_days_week: 0.6
  recommended_path:
    - knowledge_point_id: english_g3_colors
      reason: 前置知识点，先巩固
    - knowledge_point_id: english_g3_fruits
      reason: 薄弱点，今天主攻
  encouragement: "Good try! 慢慢来，我们一个一个词补。You can do it!"
```

讲解旁白（录制时念稿）："诊断用 3 题定位薄弱点；色掌握稳，星期掌握中等，水果拼写最弱。"

### 第 2 步：错词进入复习计划（约 40 秒）

`banna` 被标记 `spelling_error`，写入错词本（`MistakeRecord`）：

- 复习间隔：1 天后（SM-2 简化版，见 `data/question_bank/english/review_schedule.md`）
- 前端展示：「banana · 下次复习：明天 09:00」（错词卡片进入右侧错词本）
- 复习调度演示：前端可点「今日复习」，后端返回 `ReviewItem`（错词 + 到期原因）

讲解旁白："拼错的词立刻进错词本，明天自动复习。SM-2 规则：答错 → 1 天后；答对 1 次 → 3 天后；答对 3 次 → 15 天后封顶。"

### 第 3 步：脚手架式纠错引导（约 40 秒）

AI 精灵调用 `prompts/english/vocabulary_hint.md`，严格 3 步：

> 学生：banna
> 教练（step1_prompt）：Close! ba___na，少了中间一个 a。
> 教练（step2_memory）：记法：banana 里有两个 a，像两根香蕉。
> 教练（step3_followup）：那 apple 怎么拼？

学生补全 `banana`，教练确认，追问一次后进入下一步。

讲解旁白："不直接报答案。先提示位置 → 给记忆法 → 追问巩固。"

### 第 4 步：情景对话（约 60 秒，3 轮完整对话）

进入 `english_q_0066` 餐厅点餐对话，AI 精灵扮演服务员（`prompts/english/dialogue_partner.md`），目标句型 I'd like / Could I have：

> **Turn 1**（AI 开场）：Welcome! What would you like?
> 学生：I want noodles.（不够礼貌）
> 服务员：Good word! 但在餐厅里我们更礼貌地说 I'd like some noodles, please. 再来一遍？
> 学生：I'd like some noodles, please.
> 服务员：Great! Anything to drink?
> **Turn 2**（AI 追问）：Great! Anything to drink?
> 学生：Milk.
> 服务员：完整一点：I'd like some milk, please. 试试？
> 学生：I'd like some milk, please.
> **Turn 3**（AI 收尾）：Perfect! Here you are. Could I have the bill, please?

对话结束输出 recap：

```yaml
recap:
  good_expressions:
    - "I'd like some noodles, please."
    - "I'd like some milk, please."
  next_pattern_to_practice: "Could I have the bill?"
  encouragement: "Nice! 你的 I'd like 用得很棒。See you next time!"
  errors_logged:
    - turn: 1
      student_said: "I want noodles."
      error_type: sentence_pattern_error
```

讲解旁白："服务员是 AI 角色，从不跳出。一句肯定 → 一句提示 → 一句追问，确保学生自己补完整。"

### 第 5 步：词卡花园可视化（约 25 秒，可选）

> 前端已实现「词卡花园」组件，错词将以**种子**形态进入花园。

演示操作：

- 进入 `/garden` 路由，错词 `banana` 显示为「种子」图标。
- 学生完成 3 次正确复习（演示快进）：种子 → 发芽 → 开花 → 结果。
- 每个阶段对应不同的复习状态：
  - 种子：刚进错词本（mastery < 0.3）
  - 发芽：完成 1 次正确复习（mastery 0.3-0.6）
  - 开花：完成 2 次正确复习（mastery 0.6-0.8）
  - 结果：完成 3 次正确复习（mastery ≥ 0.8）

完整实现方案见 `docs/proposals/word-garden-implementation.md`（角色 D v0.4 增量）。讲解旁白："把抽象的 SM-2 间隔变成孩子看得见的生长过程。"

### 第 6 步：路径更新收尾（约 20 秒）

- 掌握度更新：`english_g3_fruits: 0.6`（从 0.2 提升）
- 明日学习路径：`english_g3_food_drinks`（前置满足，进阶）
- 家长端报告一句话：孩子拼写明显进步，今日错词 1 个，明天 09:00 自动复习。

讲解旁白（收尾）："一个诊断 + 一个错词 + 一段对话，孩子掌握了水果词，又学会了礼貌点餐。"

## 语音占位说明（mock）

- 当前未接通讯飞 ASR/TTS，全程使用文本跟读。
- 前端保留「跟读」按钮，点击后展示 mock 音频路径（如 `/audio/english/banana.mp3`）与文本提示。
- 接口条件允许后，替换为真实讯飞 ASR 评分（`pronunciation_weak` 标签可接入发音评分）。
- mock 清单见 `data/question_bank/english/audio_manifest.json`（v0.4 已补 6 个新词）。

## 录制前 Checklist（角色 D 自查）

- [ ] 三个 Prompt（`diagnose.md` / `vocabulary_hint.md` / `dialogue_partner.md`）均为 v0.4 版本。
- [ ] 题库 ≥ 100 题、节点 ≥ 52 个，验收脚本 5 项 PASS。
- [ ] 错词本 + SM-2 间隔表存在且 `MistakeRecord` 字段对齐 OpenAPI。
- [ ] mock 音频清单（`audio_manifest.json`）至少覆盖本次演示涉及单词：banana / milk / noodles。
- [ ] 演示前手动跑一次 `_acceptance_check.py`，确认仍 PASS。
- [ ] 词卡花园组件前端已就绪（如未就绪，第 5 步改为「快进示意」）。

## 验收对照

| 验收点（角色 D 文档第 8 节） | 本脚本覆盖 | 当前实测 |
| --- | --- | --- |
| 知识点/词汇节点 ≥ 40 | 全部节点 | **52 节点 / 354 词** |
| 题库 ≥ 60 条 | 100 题 5 类题型 | **100 题** |
| 展示错词进入复习计划 | 第 2 步 + checklist | PASS |
| 展示一个情景对话 | 第 4 步（3 轮） | PASS |
| ASR/TTS 未接通有 mock 替代 | 语音占位说明 + mock 清单 | PASS |
