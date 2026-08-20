# 英语模块验收报告（角色 D）

版本：v0.1
日期：2026-08-20
检查方式：实证脚本检查（`_acceptance_check.py`，2026-08-20 11:35 运行）
对照标准：`docs/roles/04-role-d-english.md` §8 验收标准

## 结论：五项验收标准全部 PASS

| # | 验收标准 | 要求 | 实测 | 证据位置 | 判定 |
| --- | --- | --- | --- | --- | --- |
| 1 | 知识点/词汇节点 | ≥ 40 | **46 节点 / 294 词** | `data/knowledge_graph/english/` | ✅ PASS |
| 2 | 题库 | ≥ 60 条 | **80 条** | `data/question_bank/english/english_q_0001~0080.json` | ✅ PASS |
| 3 | 错词进入复习计划 | 可展示 | MistakeRecord 示例 + SM-2 间隔表 + 演示第 2 步 | `data/question_bank/english/review_schedule.md`、`docs/demo/english-demo-script.md` | ✅ PASS |
| 4 | 情景对话 | 可展示 | **12 组** dialogue + 演示第 4 步（餐厅点餐） | `data/question_bank/english/`（type=dialogue 的 12 题）、演示脚本第 4 步 | ✅ PASS |
| 5 | ASR/TTS mock 替代 | 必须有 | mock 音频清单 + 文本跟读说明 | `data/question_bank/english/audio_manifest.json`、演示脚本"语音占位说明" | ✅ PASS |

## 明细数据

- 知识图谱：3 年级 12 / 4 年级 12 / 5 年级 12 / 6 年级 10 = **46 节点**
- 题库题型：single_choice 29 / fill_blank 29 / dialogue 12 / multiple_choice 5 / short_answer 5 = **80 题**
- 词汇总量：**294 词**（含于 46 节点 vocabulary 字段）
- 错因标签五类：spelling_error / meaning_confusion / pronunciation_weak / sentence_pattern_error / listening_error

## 复核方式

```bash
python _acceptance_check.py   # 工作区根目录脚本，重新运行即可复验
```

所有数据均通过一致性校验（46 节点 + 80 题，id 唯一、引用零悬空、枚举合法）。
