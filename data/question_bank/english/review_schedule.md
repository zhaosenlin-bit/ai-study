# 英语错词复习调度规则（SM-2 简化版）

版本：v0.3 课前讨论版
负责人：角色 D（英语模块）
用途：英语错词进入复习计划的调度依据，供角色 A 后端 `/api/v1/review/next` 与前端"下次复习时间"展示使用。

## 1. 调度规则

学生每答对一次，复习间隔递增；答错则重置回最短间隔。

| 连续答对次数 | 下次复习间隔 | 说明 |
| --- | --- | --- |
| 0（本次答错） | 1 天后 | 错词立即进入复习计划 |
| 1 | 3 天后 | 首次复习通过 |
| 2 | 7 天后 | 再次巩固 |
| 3+ | 15 天后 | 长期记忆，间隔封顶 |

规则：答错 → 间隔重置为 1 天；连续答对 3 次后不再延长，保持 15 天，避免过度记忆负担。

## 2. 演示计算示例

学生 `stu_demo_001` 在第 1 天拼错 `banana`（题目 `english_q_0013`）：

| 日期 | 事件 | 连续答对 | 下次复习日期 |
| --- | --- | --- | --- |
| 第 1 天 | 答错（banna）→ 进入错词本 | 0 | 第 2 天 |
| 第 2 天 | 复习答对 | 1 | 第 5 天 |
| 第 5 天 | 复习答对 | 2 | 第 12 天 |
| 第 12 天 | 复习答对 | 3 | 第 27 天 |

## 3. 数据字段对齐（OpenAPI v0.1）

错词记录 `MistakeRecord`：

```json
{
  "mistake_id": "mist_0001",
  "student_id": "stu_demo_001",
  "question_id": "english_q_0013",
  "subject": "english",
  "error_type": "spelling_error",
  "explanation": "banna 少了一个 a；banana 里两个 a 像两根香蕉",
  "review_count": 0,
  "next_review_at": "2026-08-20T09:00:00+08:00"
}
```

复习项 `ReviewItem`：

```json
{
  "review_id": "rev_0001",
  "student_id": "stu_demo_001",
  "subject": "english",
  "question": {
    "id": "english_q_0013",
    "subject": "english",
    "grade": 3,
    "type": "fill_blank",
    "stem": "Spell the word: 香蕉 → ba___na",
    "options": [],
    "answer": "banana",
    "knowledge_point_ids": ["english_g3_fruits"],
    "difficulty": 2
  },
  "due_reason": "上次答错，间隔 1 天到期复习"
}
```

## 4. 错因标签

| 标签 | 含义 | 示例 |
| --- | --- | --- |
| `spelling_error` | 拼写错误 | banana 写成 banna |
| `meaning_confusion` | 词义混淆 | ear 与 eye 分不清 |
| `pronunciation_weak` | 发音薄弱 | rice 与 rise 读混 |
| `sentence_pattern_error` | 句型错误 | I like 后缺名词 |
| `listening_error` | 听辨错误 | 听错单词首音 |

## 5. 扩展说明

时间允许时再参考 `ts-fsrs` 升级为 FSRS 调度；MVP 用本简化规则保证逻辑可读、可演示。
