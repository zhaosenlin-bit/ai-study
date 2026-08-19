# 英语模块演示脚本（角色 D）

版本：v0.3 课前讨论版
用途：英语模块 1 轮完整演示（约 3 分钟），供角色 E 汇总到总演示、录制 Demo 视频。
配套数据：`data/knowledge_graph/english/`（46 节点）、`data/question_bank/english/`（80 题，含 5 类题型）、`prompts/english/`（3 个 Prompt）。

## 演示流程（诊断 → 错词 → 复习 → 情景对话）

### 第 1 步：英语诊断（约 40 秒）

学生选择 3 年级 → 开始英语诊断，AI 精灵出 3 道题：

1. `english_q_0001` 词义识别：Which word means "红色"?（答对）
2. `english_q_0013` 拼写题：banana → 学生故意答成 `banna`（答错）
3. `english_q_0018` 星期顺序：What day comes after Monday?（答对）

诊断结论（`prompts/english/diagnose.md` 输出）：
- 薄弱点：`english_g3_fruits`
- 掌握度更新：`english_g3_fruits: 0.2`
- 推荐路径：先复习前置 `english_g3_colors`，再主攻 `english_g3_fruits`

### 第 2 步：错词进入复习计划（约 40 秒）

`banna` 被标记 `spelling_error`，写入错词本（`MistakeRecord`）：

- 复习间隔：1 天后（SM-2 简化版，见 `data/question_bank/english/review_schedule.md`）
- 前端展示："banana · 下次复习：明天 09:00"（错词卡片进入右侧错词本）
- 复习调度演示：前端可点"今日复习"，后端返回 `ReviewItem`（错词 + 到期原因）

### 第 3 步：脚手架式纠错引导（约 40 秒）

AI 精灵调用 `prompts/english/vocabulary_hint.md`：

> 学生：banna
> 教练：Close! ba___na，少了中间一个 a。想想——banana 里有两个 a，像两根香蕉。
> 追问：那 apple 怎么拼？

学生补全 `banana`，教练确认，追问一次后进入下一步。

### 第 4 步：情景对话（约 50 秒）

进入 `english_q_0066` 餐厅点餐对话，AI 精灵扮演服务员（`prompts/english/dialogue_partner.md`）：

> 服务员：Welcome! What would you like?
> 学生：I'd like some noodles.
> 服务员：Great! Anything to drink?
> 学生：Milk, please.
> 服务员：Perfect! Here you are. 你说了两个完整句子，句型 I'd like 用得很棒！

对话结束输出复盘：句型掌握良好，建议明天复习 `english_g4_food_words`。

### 第 5 步：路径更新收尾（约 20 秒）

- 掌握度更新：`english_g3_fruits: 0.6`
- 明日学习路径：`english_g3_food_drinks`（前置满足，进阶）
- 家长端报告一句话：孩子拼写明显进步，今日错词 1 个，明天 09:00 自动复习。

## 语音占位说明（mock）

- 当前未接通讯飞 ASR/TTS，全程使用文本跟读。
- 前端保留"跟读"按钮，点击后展示 mock 音频路径（如 `/audio/english/banana.mp3`）与文本提示。
- 接口条件允许后，替换为真实讯飞 ASR 评分（`pronunciation_weak` 标签可接入发音评分）。

## 验收对照

| 验收点（角色 D 文档第 8 节） | 本脚本覆盖 |
| --- | --- |
| 知识点/词汇节点 ≥ 40 | 46 节点 |
| 题库 ≥ 60 条 | 80 题（5 类题型） |
| 展示错词进入复习计划 | 第 2 步 |
| 展示一个情景对话 | 第 4 步 |
| ASR/TTS 未接通有 mock 替代 | 语音占位说明 |
