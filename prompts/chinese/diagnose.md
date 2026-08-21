# 语文诊断 Prompt v0.2（角色 C）

> 适用：角色 A 调用的子 prompt。版本：v0.2（2026-08-21）。
> 关联：`data/knowledge_graph/chinese/error_taxonomy.json`。

## 输入

```json
{
  "student_id": "stu_001",
  "grade": 4,
  "subject": "chinese",
  "recent_answers": [
    {"qid": "chinese_q_0019", "correct": false, "error_types": ["image_missing"]},
    {"qid": "chinese_q_0023", "correct": false, "error_types": ["detail_missing"]}
  ]
}
```

## 输出

```json
{
  "student_id": "stu_001",
  "subject": "chinese",
  "weak_points": [
    {"kp_id": "chinese_g4_古诗画面想象", "mastery": 0.3, "evidence": ["chinese_q_0019"]},
    {"kp_id": "chinese_g4_细节定位支持", "mastery": 0.4, "evidence": ["chinese_q_0023"]}
  ],
  "error_taxonomy": [
    {"tag": "image_missing", "count": 1, "category": "poem"},
    {"tag": "detail_missing", "count": 1, "category": "reading"}
  ],
  "recommended_path": [
    "走 poem_scaffold.md 三步引导（image_missing）",
    "走 reading_hint.md 三步法（detail_missing）"
  ]
}
```

## 映射规则

| 题库 error_type | 知识图谱 KP | 引导 Prompt |
|----------------|-------------|-------------|
| image_missing | chinese_g*_古诗画面想象 | poem_scaffold.md |
| emotion_poem_missing | chinese_g*_古诗情境讲解 | poem_scaffold.md |
| recitation_weak | chinese_g*_古诗背诵字形 | 自词 + 形近字卡 |
| word_meaning | chinese_g*_词义辨析 | reading_hint.md + 造句 |
| stroke_error | chinese_g*_笔画笔顺规范 | 田字格描红 |
| phonetic_confusion | chinese_g*_形近字辨析 | 对比表 + 编故事 |
| detail_missing | chinese_g*_细节定位支持 | reading_hint.md 三步法 |
| main_idea_missing | chinese_g*_主旨把握支持 | reading_hint.md 首尾段 |
| inference_error | chinese_g*_言之推理推断证据 | reading_hint.md 找证据 |
| emotion_missing | chinese_g*_情感体会 | reading_hint.md 情感词 |
| expression_weak | chinese_g*_表达条理清晰 | reading_hint.md 模板 |
| idiom_misuse | chinese_g*_成语辨析 | 成语故事 + 造句 |
| collocation_error | chinese_g*_词义搭配 | 搭配清单 + 选择题 |
