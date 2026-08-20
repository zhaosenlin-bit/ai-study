# 英语模块数据接入指南（角色 A / E 对接用）

版本：v0.1
维护：角色 D（胡智博）
用途：让角色 A 后端能直接加载英语图谱/题库并实现复习调度，让角色 E 前端能取到演示所需数据。
配套：`docs/api/openapi-contract-v0.yaml`（接口契约）、`data/question_bank/english/review_schedule.md`（复习规则）。

## 1. 数据目录总览

| 目录 | 内容 | 数量 |
| --- | --- | --- |
| `data/knowledge_graph/english/` | 知识图谱节点（每文件 1 节点） | 46 个 JSON |
| `data/question_bank/english/` | 题目（每文件 1 题）+ 复习规则 + 音频清单 | 80 题 + 2 文件 |
| `prompts/english/` | 英语 Agent Prompt | 3 个 md |
| `tests/fixtures/english/` | 接口测试夹具 | 4 个 JSON |

## 2. 知识图谱格式（KnowledgePoint）

文件：`english_g{grade}_{topic}.json`，如 `english_g4_food_words.json`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 唯一，命名 `english_g{3-6}_{topic}` |
| subject | string | 恒为 `english` |
| grade | int | 3-6 |
| name | string | 知识点名称（中文） |
| difficulty | int | 1-5 |
| prerequisites | string[] | 前置知识点 id（学习顺序依赖） |
| next | string[] | 进阶知识点 id（与 prerequisites 双向对应） |
| vocabulary | string[] | 核心单词表（单词卡数据源） |
| common_misconceptions | string[] | 常见错因（用于诊断与错因标注） |
| demo_value | string | 演示价值说明（供前端选场景） |

读取示例（Python）：

```python
import json, glob
kgs = {}
for p in glob.glob("data/knowledge_graph/english/*.json"):
    with open(p, encoding="utf-8") as f:
        d = json.load(f)
    kgs[d["id"]] = d
# 按年级取全部节点
g3 = [k for k in kgs.values() if k["grade"] == 3]
```

## 3. 题库格式（Question）

文件：`english_q_0001.json` ~ `english_q_0080.json`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | `english_q_XXXX` 连续编号 |
| subject | string | `english` |
| grade | int | 3-6 |
| type | string | `single_choice` / `multiple_choice` / `fill_blank` / `short_answer` / `dialogue` |
| stem | string | 题干（可能含中文说明） |
| options | string[] | 选项（单选/多选有值；填空/简答为空数组） |
| answer | string | 答案；**多选为逗号分隔的内容**，如 `"apple, banana"` |
| knowledge_point_ids | string[] | 关联知识点（必须存在于图谱） |
| rubric | string | 判分说明 + 错因标签（如 `spelling_error`） |
| difficulty | int | 1-5 |

读取示例：按知识点取题（诊断出题用）：

```python
def questions_by_kp(qs, kp_id):
    return [q for q in qs if kp_id in q["knowledge_point_ids"]]
```

## 4. 复习调度规则（SM-2 简化版）

规则文档：`data/question_bank/english/review_schedule.md`

| 连续答对次数 | 下次复习间隔 |
| --- | --- |
| 0（答错） | 1 天 |
| 1 | 3 天 |
| 2 | 7 天 |
| 3+ | 15 天（封顶） |

后端更新逻辑（伪代码）：

```python
def on_review_result(mistake, correct: bool) -> MistakeRecord:
    if correct:
        mistake.review_count += 1
    else:
        mistake.review_count = 0
    mistake.next_review_at = today + INTERVALS[min(mistake.review_count, 3)]
    return mistake
```

字段对齐：`MistakeRecord`（mistake_id / student_id / question_id / subject / error_type / review_count / next_review_at），`ReviewItem`（review_id / student_id / subject / question / due_reason）。

## 5. 错因标签（五类）

| 标签 | 含义 | 建议处置 |
| --- | --- | --- |
| `spelling_error` | 拼写错误 | 词汇提示 + 记忆法 |
| `meaning_confusion` | 词义混淆 | 词义对比 |
| `pronunciation_weak` | 发音薄弱 | 跟读练习（mock/ASR） |
| `sentence_pattern_error` | 句型错误 | 句型示范 + 仿写 |
| `listening_error` | 听辨错误 | 重听 + 慢速播放 |

## 6. 典型用例

1. **诊断出题**：按学生年级取题，优先覆盖薄弱知识点，5 题一轮。
2. **路径规划**：`diagnosis_result` 中的 recommended_path 按 prerequisites 排序（先补前置，再主攻薄弱点）。
3. **错词进复习**：答题错误 → 写 MistakeRecord（error_type 从 rubric 提取）→ review_count=0、next_review_at=+1 天。
4. **今日复习**：`/api/v1/review/next` 返回 next_review_at ≤ now 的错词对应题目（ReviewItem）。
5. **前端跟读**：`audio_manifest.json` 提供 `/audio/english/*.mp3` mock 路径，ASR/TTS 接通后替换。

## 7. 测试夹具（tests/fixtures/english/）

| 文件 | 用途 |
| --- | --- |
| `student_profile.json` | 学生画像样例（mastery/weak_points） |
| `diagnosis_result.json` | 诊断结果样例（含 recommended_path） |
| `mistake_record.json` | 错词记录样例（spelling_error） |
| `review_item.json` | 复习项样例（含完整 Question） |

后端未就绪时，前端可直读夹具演示；后端单测可直接引用夹具断言。
