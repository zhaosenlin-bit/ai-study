# 角色 D 执行文档：英语模块负责人

分支：`feature/subject-english`  
主责目录：`data/knowledge_graph/english/`、`data/question_bank/english/`、`prompts/english/`  
目标：让英语模块展示“单词记忆 + 情景对话 + 复习调度”，如果接口条件允许，再接入讯飞 ASR/TTS 做口语亮点。

## 1. 你负责什么

1. 小学 3-6 年级英语词库和知识图谱。
2. 单词、句型、情景对话题库。
3. 错词本和复习调度规则。
4. 英语单词/对话引导 Prompt。
5. 英语模块演示脚本。

## 2. 你的分支和目录

```bash
git checkout develop
git pull origin develop
git checkout -b feature/subject-english
```

目录：

```text
data/knowledge_graph/english/
data/question_bank/english/
prompts/english/
tests/fixtures/english/
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

## 7. Prompt 要求

至少 3 个文件：

```text
prompts/english/diagnose.md
prompts/english/vocabulary_hint.md
prompts/english/dialogue_partner.md
```

Prompt 必须做到：

- 尽量用短英文 + 中文解释。
- 不直接翻译整句，先让学生猜关键词。
- 对错词生成一个轻量记忆法。
- 情景对话要能继续追问。

## 8. 验收标准

- 英语知识点/词汇节点不少于 40 个。
- 题库不少于 60 条。
- 能展示一次错词进入复习计划。
- 能展示一个情景对话。
- 如果 ASR/TTS 未接通，必须有 mock 音频/文本替代流程。

## 9. 提交示例

```bash
git add data/knowledge_graph/english data/question_bank/english prompts/english tests/fixtures/english
git commit -m "feat(english): add vocabulary graph and review schedule data"
git push -u origin feature/subject-english
```
