# 角色 D 执行文档：英语模块负责人

分支：`feature/subject-english`  
主责目录：`数据/knowledge_graph/english/`、`数据/question_bank/english/`、`提示词库/english/`  
目标：让英语模块展示“单词记忆 + 情景对话 + 复习调度”，如果接口条件允许，再接入讯飞 ASR/TTS 做口语亮点。

## 0. 开发前先读

角色 D 开始写内容前，不是只读这份文档。先按顺序读：`README.md`、总 PRD、课堂讲义、技术栈指南、文档领取指南、`CONTRIBUTING.md`、`文档/api/openapi-contract-v0.yaml`，再读本角色文档。

如果今晚老师采纳学生新方案，先看 `文档/proposals/final-decision.md` 和新版总 PRD，再决定英语词库、听说任务或复习规则是否要调整。

## 1. 你负责什么

1. 小学 3-6 年级英语词库和知识图谱。
2. 单词、句型、情景对话题库。
3. 错词本和复习调度规则。
4. 英语单词/对话引导 Prompt。
5. 英语模块演示脚本。

你不是只负责“整理单词”。你的任务是让英语模块能展示记忆和复习：学生哪里拼错、什么时候再复习、在什么情景里使用这个词。

## 2. 你的分支和目录

```bash
git checkout develop
git pull origin develop
git checkout -b feature/subject-english
```

目录：

```text
数据/knowledge_graph/english/
数据/question_bank/english/
提示词库/english/
测试/fixtures/english/
```

## 3. MVP 知识范围

优先做 3-4 年级：

- 三年级：字母、颜色、数字、家庭成员、基础问候。
- 四年级：学校、食物、动物、天气、日常对话。
- 演示重点：根据错词生成复习任务，情景对话中引导学生说完整句子。

## 4. 知识图谱格式

```json
{
  "id": "english_g4_food_words",
  "subject": "english",
  "grade": 4,
  "name": "Food words",
  "difficulty": 2,
  "prerequisites": ["english_g3_basic_greetings"],
  "next": ["english_g4_like_sentence"],
  "vocabulary": ["rice", "fish", "milk", "bread"],
  "common_misconceptions": ["拼写漏字母", "I like 后面句型不完整"],
  "demo_value": "适合展示单词复习和情景对话"
}
```

## 5. 题库要求

至少提交：

- 30 个核心单词卡。
- 20 道单词识别/拼写题。
- 10 组情景对话。
- 10 道句型补全题。

错因标签：

- `spelling_error`: 拼写错误。
- `meaning_confusion`: 词义混淆。
- `pronunciation_weak`: 发音薄弱。
- `sentence_pattern_error`: 句型错误。
- `listening_error`: 听辨错误。

## 6. 复习调度

MVP 可以使用 SM-2 简化版：

```text
答错：1 天后复习
答对 1 次：3 天后复习
答对 2 次：7 天后复习
答对 3 次：15 天后复习
```

如果时间允许，再参考 `ts-fsrs` 做 FSRS 调度。

MVP 先用简单规则，是为了让大家能看懂。后续如果要更专业，可以学习 Anki 和 FSRS，把复习间隔做得更科学。

## 7. Prompt 要求

至少 3 个文件：

```text
提示词库/english/diagnose.md
提示词库/english/vocabulary_hint.md
提示词库/english/dialogue_partner.md
```

Prompt 必须做到：

- 尽量用短英文 + 中文解释。
- 不直接翻译整句，先让学生猜关键词。
- 对错词生成一个轻量记忆法。
- 情景对话要能继续追问。

## 7.1 和前端体验的配合

英语内容要适合 AI 精灵陪练：

- 单词卡要短，方便快速反馈。
- 情景对话要有角色，例如在餐厅、在教室、在家里。
- 错词要能进入复习计划，前端能显示“下次复习时间”。
- 如果语音暂时不接通，先用文本跟读和 mock 音频占位。

## 8. 验收标准

- 英语知识点/词汇节点不少于 40 个。
- 题库不少于 60 条。
- 能展示一次错词进入复习计划。
- 能展示一个情景对话。
- 如果 ASR/TTS 未接通，必须有 mock 音频/文本替代流程。

## 9. 提交示例

```bash
git add 数据/knowledge_graph/english 数据/question_bank/english 提示词库/english 测试/fixtures/english
git commit -m "feat(english): add vocabulary graph and review schedule data"
git push -u origin feature/subject-english
```
