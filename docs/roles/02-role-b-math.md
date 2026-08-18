# 角色 B 执行文档：数学模块负责人

分支：`feature/subject-math`  
主责目录：`data/knowledge_graph/math/`、`data/question_bank/math/`、`prompts/math/`  
目标：让数学模块能展示“错因诊断 + 分步引导 + 路径推荐”，成为三科中最容易让评委看懂自适应策略的样板。

## 1. 你负责什么

1. 小学 3-6 年级数学知识图谱。
2. 数学诊断题和演示题库。
3. 数学错因分类规则。
4. 数学 Socratic 引导 Prompt。
5. 数学模块演示脚本。

你不是只负责“出数学题”。你的任务是把数学内容做成 Agent 能理解的数据：每道题对应哪个知识点，错了可能是什么原因，下一步应该补哪个前置知识。这样系统才能展示真正的自适应。

## 2. 你的分支和目录

```bash
git checkout develop
git pull origin develop
git checkout -b feature/subject-math
```

目录：

```text
data/knowledge_graph/math/
data/question_bank/math/
prompts/math/
tests/fixtures/math/
```

## 3. MVP 知识范围

优先做 3-4 年级，能稳再扩展 5-6 年级。

必选知识点：

- 三年级：万以内加减、倍的认识、多位数乘一位数、面积初步。
- 四年级：大数认识、三位数乘两位数、除数是两位数、小数加减、角和图形。
- 演示重点：分数初步或应用题建模，适合展示“引导而非直接给答案”。

## 4. 知识图谱格式

每个知识点用 JSON：

```json
{
  "id": "math_g4_decimal_addition",
  "subject": "math",
  "grade": 4,
  "name": "小数加减法",
  "difficulty": 3,
  "prerequisites": ["math_g3_place_value"],
  "next": ["math_g5_decimal_multiplication"],
  "common_misconceptions": ["小数点没有对齐", "把小数部分当整数直接相加"],
  "demo_value": "适合做错因归因和分步纠错"
}
```

数学知识图谱先用 JSON，不是因为 JSON 最高级，而是因为第一版最容易检查、合并和调试。后续如果要做更复杂的前置关系可视化，再升级 Neo4j。

## 5. 题库要求

至少提交：

- 30 道诊断题。
- 20 道巩固练习题。
- 10 道错题本复习题。
- 每道题必须标注知识点、答案、解析、错因标签。

错因标签统一：

- `careless`: 粗心。
- `concept_missing`: 概念缺失。
- `calculation_error`: 计算错误。
- `modeling_error`: 应用题建模错误。
- `unit_error`: 单位或量纲错误。

## 6. Prompt 要求

至少 3 个文件：

```text
prompts/math/diagnose.md
prompts/math/scaffold_hint.md
prompts/math/mistake_analysis.md
```

Prompt 必须遵守：

- 不直接给最终答案。
- 先判断学生卡在哪一步。
- 最多给三级提示：方向提示、步骤提示、关键公式提示。
- 每次回答最后给学生一个小问题。

## 6.1 和前端体验的配合

数学题要给 E 提供适合展示的数据：

- 题干不要太长，适合放在中央学习舞台。
- 错因标签要短，适合显示在错题本。
- 分步提示最多 3 级，适合 AI 精灵逐步引导。
- 至少准备 1 道“学生明显答错后 AI 引导成功”的演示题。

## 7. 验收标准

- 数学知识点不少于 30 个。
- 题库不少于 60 道。
- 能支持一轮“诊断 -> 发现薄弱点 -> 推荐任务 -> 分步引导 -> 错题复习”。
- 文件格式能被角色 A 的加载器读取。
- 至少给角色 E 一份数学演示脚本。

## 8. 提交示例

```bash
git add data/knowledge_graph/math data/question_bank/math prompts/math tests/fixtures/math
git commit -m "feat(math): add grade 3-4 knowledge graph and diagnosis bank"
git push -u origin feature/subject-math
```
