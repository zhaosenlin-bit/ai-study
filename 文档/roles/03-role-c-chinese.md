# 角色 C 执行文档：语文模块负责人

分支：`feature/subject-chinese`  
主责目录：`数据/knowledge_graph/chinese/`、`数据/question_bank/chinese/`、`提示词库/chinese/`  
目标：让语文模块展示“识字/古诗/阅读理解”的个性化引导，重点体现情境化讲解和表达能力提升。

## 0. 开发前先读

角色 C 开始写内容前，不是只读这份文档。先按顺序读：`README.md`、总 PRD、课堂讲义、技术栈指南、文档领取指南、`CONTRIBUTING.md`、`文档/api/openapi-contract-v0.yaml`，再读本角色文档。

如果今晚老师采纳学生新方案，先看 `文档/proposals/final-decision.md` 和新版总 PRD，再决定语文题型、知识点或 Prompt 是否要调整。

## 1. 你负责什么

1. 小学 3-6 年级语文知识图谱。
2. 古诗、阅读、识字/词语题库。
3. 语文阅读理解错因分类。
4. 古诗情境化讲解 Prompt。
5. 语文模块演示脚本。

你不是只负责“找语文题”。你的任务是把语文内容做成能引导学生思考的学习材料：古诗要能引导画面想象，阅读要能引导回原文找证据，表达题要能给支架。

## 2. 你的分支和目录

```bash
git checkout develop
git pull origin develop
git checkout -b feature/subject-chinese
```

目录：

```text
数据/knowledge_graph/chinese/
数据/question_bank/chinese/
提示词库/chinese/
测试/fixtures/chinese/
```

## 3. MVP 知识范围

优先做 3-4 年级：

- 识字词语：近义词、反义词、成语、词语搭配。
- 古诗：作者、朝代、关键字词、画面、情感。
- 阅读：主旨、细节、推断、词句理解。
- 表达：看图说话、短句扩写。

## 4. 知识图谱格式

```json
{
  "id": "chinese_g4_poem_image",
  "subject": "chinese",
  "grade": 4,
  "name": "古诗画面想象",
  "difficulty": 3,
  "prerequisites": ["chinese_g3_keyword_explain"],
  "next": ["chinese_g5_poem_emotion"],
  "common_misconceptions": ["只会背诵不会理解画面", "把字面翻译当作情感理解"],
  "demo_value": "适合做情境化讲解和追问"
}
```

语文知识图谱先用 JSON，重点不是做得很大，而是让每个知识点都能被 Agent 使用。比如“古诗画面想象”要能连接到具体题目、提示语和常见错误。

## 5. 题库要求

至少提交：

- 15 道古诗理解题。
- 20 道阅读理解题。
- 15 道词语/识字题。
- 10 道表达类开放题。

错因标签：

- `word_meaning`: 字词理解错误。
- `detail_missing`: 细节定位错误。
- `main_idea_missing`: 主旨概括错误。
- `inference_error`: 推断错误。
- `expression_weak`: 表达不完整。

## 6. Prompt 要求

至少 3 个文件：

```text
提示词库/chinese/diagnose.md
提示词库/chinese/poem_scaffold.md
提示词库/chinese/reading_hint.md
```

Prompt 必须做到：

- 古诗不要直接给翻译，先让学生想象画面。
- 阅读题先引导回原文找证据。
- 表达题先给结构支架，再让学生补充。
- 语言要适合小学生，短句、鼓励、具体。

## 6.1 和前端体验的配合

语文内容要适合沉浸式展示：

- 古诗材料可以配“画面关键词”，方便前端做视觉提示。
- 阅读材料不要太长，MVP 先选短文。
- 表达题要有句式支架，方便 AI 精灵一步步追问。
- 至少准备 1 条“古诗画面引导”演示路线。

## 7. 验收标准

- 语文知识点不少于 30 个。
- 题库不少于 60 道。
- 至少有一个古诗演示流程和一个阅读演示流程。
- 每道题标注知识点和错因标签。
- 能被角色 A 加载，能被角色 E 展示。

## 8. 提交示例

```bash
git add 数据/knowledge_graph/chinese 数据/question_bank/chinese 提示词库/chinese 测试/fixtures/chinese
git commit -m "feat(chinese): add poem and reading diagnosis content"
git push -u origin feature/subject-chinese
```
