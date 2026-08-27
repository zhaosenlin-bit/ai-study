/**
 * Mock 演示数据（角色 E 先行用假数据页面）
 *
 * 数据结构与 文档/api/openapi-contract-v0.yaml 完全一致，
 * 覆盖三科（数学/语文/英语），足够支撑一轮完整演示。
 * 真实 API 就绪后，由 src/api/index.ts 一键切换。
 */
import type {
  DemoStudentMeta,
  DiagnosisResult,
  KnowledgePoint,
  LearningPath,
  MistakeRecord,
  ParentReport,
  Question,
  StudentProfile,
} from "@contracts";

/** 演示学生元信息（前端本地扩展） */
export const DEMO_STUDENTS: DemoStudentMeta[] = [
  { student_id: "stu_demo_001", name: "小明", grade: 4, streak_days: 7, tagline: "分数小能手正在养成中" },
  { student_id: "stu_demo_002", name: "小红", grade: 5, streak_days: 3, tagline: "小数除法闯关进行时" },
];

export const KNOWLEDGE_POINTS: Record<string, KnowledgePoint> = {
  math_g4_fraction_basic: { id: "math_g4_fraction_basic", subject: "math", grade: 4, name: "分数的初步认识", difficulty: 3, prerequisites: ["math_g3_division_meaning"], common_misconceptions: ["把分母相加", "不能理解平均分"] },
  math_g4_area_perimeter: { id: "math_g4_area_perimeter", subject: "math", grade: 4, name: "长方形周长与面积", difficulty: 3, prerequisites: ["math_g4_multiplication"] },
  math_g4_multiplication: { id: "math_g4_multiplication", subject: "math", grade: 4, name: "两位数乘法", difficulty: 2 },
  math_g5_decimal_division: { id: "math_g5_decimal_division", subject: "math", grade: 5, name: "小数除法", difficulty: 3 },
  chinese_g4_poem_image: { id: "chinese_g4_poem_image", subject: "chinese", grade: 4, name: "古诗画面与情感", difficulty: 2, common_misconceptions: ["只看字面翻译"] },
  chinese_g4_reading_main_idea: { id: "chinese_g4_reading_main_idea", subject: "chinese", grade: 4, name: "阅读抓主旨", difficulty: 3, common_misconceptions: ["复述情节代替概括"] },
  chinese_g4_character_meaning: { id: "chinese_g4_character_meaning", subject: "chinese", grade: 4, name: "多义字辨析", difficulty: 3 },
  chinese_g5_exposition_reading: { id: "chinese_g5_exposition_reading", subject: "chinese", grade: 5, name: "说明文阅读", difficulty: 3 },
  english_g4_food_words: { id: "english_g4_food_words", subject: "english", grade: 4, name: "食物单词", difficulty: 1 },
  english_g4_verb_tense: { id: "english_g4_verb_tense", subject: "english", grade: 4, name: "一般现在时动词变化", difficulty: 3, common_misconceptions: ["第三人称单数忘加s"] },
  english_g4_daily_dialogue: { id: "english_g4_daily_dialogue", subject: "english", grade: 4, name: "日常情景对话", difficulty: 2 },
  english_g5_past_tense: { id: "english_g5_past_tense", subject: "english", grade: 5, name: "一般过去时", difficulty: 3 },
};

/** 学生画像 */
export const PROFILES: Record<string, StudentProfile> = {
  stu_demo_001: {
    student_id: "stu_demo_001",
    name: "小明",
    grade: 4,
    mastery: {
      math_g4_fraction_basic: 0.45,
      math_g4_area_perimeter: 0.72,
      math_g4_multiplication: 0.85,
      chinese_g4_poem_image: 0.68,
      chinese_g4_reading_main_idea: 0.52,
      chinese_g4_character_meaning: 0.8,
      english_g4_food_words: 0.6,
      english_g4_verb_tense: 0.48,
      english_g4_daily_dialogue: 0.75,
    },
    weak_points: ["math_g4_fraction_basic", "chinese_g4_reading_main_idea", "english_g4_verb_tense"],
    emotion_state: "neutral",
    learning_style: "visual",
    updated_at: "2026-08-18T20:00:00+08:00",
  },
  stu_demo_002: {
    student_id: "stu_demo_002",
    name: "小红",
    grade: 5,
    mastery: {
      math_g5_decimal_division: 0.55,
      math_g4_multiplication: 0.9,
      chinese_g5_exposition_reading: 0.6,
      chinese_g4_character_meaning: 0.88,
      english_g5_past_tense: 0.5,
      english_g4_daily_dialogue: 0.82,
    },
    weak_points: ["math_g5_decimal_division", "english_g5_past_tense"],
    emotion_state: "happy",
    learning_style: "auditory",
    updated_at: "2026-08-18T20:00:00+08:00",
  },
};

/** 诊断题（四年级小明） */
const QUESTIONS_G4: Question[] = [
  { id: "math_q_0001", subject: "math", grade: 4, type: "single_choice", stem: "把一个苹果平均分成 4 份，取其中 1 份，用哪个分数表示？", options: ["1/2", "1/4", "4/1", "2/4"], answer: "1/4", knowledge_point_ids: ["math_g4_fraction_basic"], rubric: "检查学生是否理解分母表示平均分的份数", difficulty: 2 },
  { id: "math_q_0002", subject: "math", grade: 4, type: "single_choice", stem: "一个长方形长 6 厘米、宽 4 厘米，它的周长是多少厘米？", options: ["10", "20", "24", "48"], answer: "20", knowledge_point_ids: ["math_g4_area_perimeter"], rubric: "检查周长公式 (长+宽)×2", difficulty: 3 },
  { id: "math_q_0003", subject: "math", grade: 4, type: "fill_blank", stem: "边长 5 厘米的正方形，面积是 ____ 平方厘米。", answer: "25", knowledge_point_ids: ["math_g4_area_perimeter"], difficulty: 2 },
  { id: "chinese_q_0001", subject: "chinese", grade: 4, type: "single_choice", stem: "《静夜思》中“举头望明月”，诗人当时最可能是什么心情？", options: ["高兴", "想念家乡", "生气", "害怕"], answer: "想念家乡", knowledge_point_ids: ["chinese_g4_poem_image"], rubric: "体会诗歌画面背后的情感", difficulty: 2 },
  { id: "chinese_q_0002", subject: "chinese", grade: 4, type: "short_answer", stem: "短文讲了小明帮助摔倒的老人，你觉得这篇短文主要想告诉我们什么？（用一两句话回答）", knowledge_point_ids: ["chinese_g4_reading_main_idea"], rubric: "能否从情节中归纳中心", difficulty: 3 },
  { id: "chinese_q_0003", subject: "chinese", grade: 4, type: "multiple_choice", stem: "下面哪个词语中的“熟”表示“熟练”的意思？", options: ["饭熟了", "这条路我很熟", "果子熟了", "熟透了"], answer: "这条路我很熟", knowledge_point_ids: ["chinese_g4_character_meaning"], difficulty: 3 },
  { id: "english_q_0001", subject: "english", grade: 4, type: "single_choice", stem: "Which one is a fruit?（哪个是水果？）", options: ["apple", "book", "desk", "pen"], answer: "apple", knowledge_point_ids: ["english_g4_food_words"], difficulty: 1 },
  { id: "english_q_0002", subject: "english", grade: 4, type: "fill_blank", stem: "He ____ (go) to school every day. 请写出括号中动词的正确形式。", answer: "goes", knowledge_point_ids: ["english_g4_verb_tense"], rubric: "第三人称单数一般现在时", difficulty: 3 },
  { id: "english_q_0003", subject: "english", grade: 4, type: "dialogue", stem: "你想邀请同桌放学后一起去公园，用英语说一句话吧！", knowledge_point_ids: ["english_g4_daily_dialogue"], difficulty: 2 },
];

/** 诊断题（五年级小红） */
const QUESTIONS_G5: Question[] = [
  { id: "math_q_0101", subject: "math", grade: 5, type: "single_choice", stem: "7.5 ÷ 0.5 等于多少？", options: ["1.5", "15", "150", "0.15"], answer: "15", knowledge_point_ids: ["math_g5_decimal_division"], difficulty: 3 },
  { id: "math_q_0102", subject: "math", grade: 5, type: "single_choice", stem: "0.36 ÷ 0.6 = ?", options: ["0.6", "6", "0.06", "60"], answer: "0.6", knowledge_point_ids: ["math_g5_decimal_division"], difficulty: 3 },
  { id: "math_q_0103", subject: "math", grade: 5, type: "fill_blank", stem: "把 4.8 平均分成 6 份，每份是 ____。", answer: "0.8", knowledge_point_ids: ["math_g5_decimal_division"], difficulty: 2 },
  { id: "chinese_q_0101", subject: "chinese", grade: 5, type: "single_choice", stem: "说明文中，常用的说明方法不包括下列哪一项？", options: ["列数字", "打比方", "夸张", "举例子"], answer: "夸张", knowledge_point_ids: ["chinese_g5_exposition_reading"], difficulty: 3 },
  { id: "chinese_q_0102", subject: "chinese", grade: 5, type: "short_answer", stem: "一篇说明文介绍“鲸是哺乳动物”，最可能用到的说明方法有哪些？请列举两个。", knowledge_point_ids: ["chinese_g5_exposition_reading"], difficulty: 3 },
  { id: "english_q_0101", subject: "english", grade: 5, type: "single_choice", stem: "Yesterday, I ____ to the park.", options: ["go", "went", "goes", "going"], answer: "went", knowledge_point_ids: ["english_g5_past_tense"], difficulty: 3 },
  { id: "english_q_0102", subject: "english", grade: 5, type: "fill_blank", stem: "She ____ (watch) TV last night. 请写出括号中动词的正确形式。", answer: "watched", knowledge_point_ids: ["english_g5_past_tense"], difficulty: 3 },
];

export const QUESTIONS_BY_STUDENT: Record<string, Question[]> = {
  stu_demo_001: QUESTIONS_G4,
  stu_demo_002: QUESTIONS_G5,
};

/** 学习路径 */
export const PATHS: Record<string, LearningPath> = {
  stu_demo_001: {
    student_id: "stu_demo_001",
    reason: "诊断发现：分数、阅读主旨、动词时态掌握度低于 60%，建议优先巩固薄弱点。",
    tasks: [
      { task_id: "task_m1", subject: "math", title: "分数的初步认识", knowledge_point_id: "math_g4_fraction_basic", status: "todo" },
      { task_id: "task_c1", subject: "chinese", title: "阅读抓主旨", knowledge_point_id: "chinese_g4_reading_main_idea", status: "todo" },
      { task_id: "task_e1", subject: "english", title: "一般现在时动词变化", knowledge_point_id: "english_g4_verb_tense", status: "doing" },
      { task_id: "task_m2", subject: "math", title: "长方形周长与面积", knowledge_point_id: "math_g4_area_perimeter", status: "done" },
      { task_id: "task_c2", subject: "chinese", title: "古诗画面与情感", knowledge_point_id: "chinese_g4_poem_image", status: "done" },
      { task_id: "task_e2", subject: "english", title: "食物单词", knowledge_point_id: "english_g4_food_words", status: "done" },
    ],
  },
  stu_demo_002: {
    student_id: "stu_demo_002",
    reason: "诊断发现：小数除法、一般过去时掌握度低于 60%，建议优先巩固。",
    tasks: [
      { task_id: "task_m1", subject: "math", title: "小数除法", knowledge_point_id: "math_g5_decimal_division", status: "todo" },
      { task_id: "task_e1", subject: "english", title: "一般过去时", knowledge_point_id: "english_g5_past_tense", status: "todo" },
      { task_id: "task_c1", subject: "chinese", title: "说明文阅读", knowledge_point_id: "chinese_g5_exposition_reading", status: "doing" },
    ],
  },
};

/** 错题本 */
export const MISTAKES: Record<string, MistakeRecord[]> = {
  stu_demo_001: [
    { mistake_id: "mistake_m01", student_id: "stu_demo_001", question_id: "math_q_0001", subject: "math", error_type: "概念混淆", explanation: "把分母当成了总块数，不理解平均分含义", review_count: 2, next_review_at: "2026-08-19T20:00:00+08:00" },
    { mistake_id: "mistake_e01", student_id: "stu_demo_001", question_id: "english_q_0002", subject: "english", error_type: "规则不熟", explanation: "第三人称单数动词忘记加 s", review_count: 1, next_review_at: "2026-08-18T21:30:00+08:00" },
    { mistake_id: "mistake_c01", student_id: "stu_demo_001", question_id: "chinese_q_0002", subject: "chinese", error_type: "表达不清", explanation: "能复述情节，但不会归纳中心句", review_count: 1, next_review_at: "2026-08-20T20:00:00+08:00" },
  ],
  stu_demo_002: [
    { mistake_id: "mistake_m01", student_id: "stu_demo_002", question_id: "math_q_0101", subject: "math", error_type: "计算失误", explanation: "除数是小数时忘记先移动小数点", review_count: 2, next_review_at: "2026-08-19T19:00:00+08:00" },
    { mistake_id: "mistake_e01", student_id: "stu_demo_002", question_id: "english_q_0101", subject: "english", error_type: "规则不熟", explanation: "一般过去时动词变化记忆不牢", review_count: 1, next_review_at: "2026-08-18T21:00:00+08:00" },
  ],
};

/** 家长报告 */
export const REPORTS: Record<string, ParentReport> = {
  stu_demo_001: {
    student_id: "stu_demo_001",
    summary: "小明本周完成 9 道三科诊断题，整体掌握度约 64%。数学分数概念、英语动词时态是主要薄弱点，建议每天 15 分钟专项练习，坚持一周后复查。",
    mastery: { math: 0.58, chinese: 0.65, english: 0.55 },
    mistake_stats: { 概念混淆: 3, 粗心: 2, 规则不熟: 1 },
    suggestions: [
      "每天 10 分钟分数专项小练习（画图理解平均分）",
      "英语动词变化编成口诀，边读边写记忆",
      "阅读题先圈出中心句，再归纳主旨",
    ],
  },
  stu_demo_002: {
    student_id: "stu_demo_002",
    summary: "小红本周完成 7 道诊断题，整体掌握度约 72%。小数除法计算步骤和英语过去时是薄弱点，建议结合生活情境练习。",
    mastery: { math: 0.68, chinese: 0.76, english: 0.62 },
    mistake_stats: { 计算失误: 2, 规则不熟: 2, 概念混淆: 1 },
    suggestions: [
      "用购物找零练习小数除法",
      "每天用英语说一句“昨天做了什么”",
      "说明文先看首尾段抓中心",
    ],
  },
};

/** 诊断结果（提交后返回） */
export const DIAGNOSIS_RESULTS: Record<string, DiagnosisResult> = {
  stu_demo_001: {
    student_id: "stu_demo_001",
    weak_points: ["math_g4_fraction_basic", "chinese_g4_reading_main_idea", "english_g4_verb_tense"],
    mastery_updates: { math_g4_fraction_basic: 0.45, chinese_g4_reading_main_idea: 0.52, english_g4_verb_tense: 0.48 },
    recommended_path: PATHS["stu_demo_001"],
  },
  stu_demo_002: {
    student_id: "stu_demo_002",
    weak_points: ["math_g5_decimal_division", "english_g5_past_tense"],
    mastery_updates: { math_g5_decimal_division: 0.55, english_g5_past_tense: 0.5 },
    recommended_path: PATHS["stu_demo_002"],
  },
};

/** AI 辅导：分步提示话术（hint_level 0→3，不直接给答案） */
export const CHAT_HINTS: Record<string, { level: number; text: string }[]> = {
  math: [
    { level: 0, text: "别急～我们先来找已知条件：这道题里你看到了哪些数字和关键词？" },
    { level: 1, text: "很好！再想想：题目里说的“平均分”，是什么意思？你能画个图表示吗？" },
    { level: 2, text: "快对了！注意：分母表示平均分成的份数，分子表示取了几份。再试一次？" },
    { level: 3, text: "我们一起看：分母 4 表示分成 4 份，分子 1 表示取 1 份，所以答案是 1/4。你下次一定能自己算出来！" },
  ],
  chinese: [
    { level: 0, text: "我们先来聊聊：读了这段话，你脑子里出现了什么画面？" },
    { level: 1, text: "嗯！那这首诗里诗人的动作是“举头望明月”，你猜他当时在想什么？" },
    { level: 2, text: "已经很接近了！诗歌的情感常常藏在景物里，再品一品“思故乡”这几个字。" },
    { level: 3, text: "看这里：“低头思故乡”直接点明了情感——想念家乡。记住这个方法：抓关键词，想画面。" },
  ],
  english: [
    { level: 0, text: "Great try! 我们先看主语：句子里的 he 是第几人称？" },
    { level: 1, text: "对，he 是第三人称单数！一般现在时里，动词要变成什么形式呢？" },
    { level: 2, text: "还差一点点：go 变成 goes，规则是“第三人称单数 + s/es”。再拼一遍试试？" },
    { level: 3, text: "答案就是 goes。记住口诀：第三人称单数，动词加 s！你真棒！" },
  ],
};

/** Agent 工具痕迹（演示用） */
export const TOOL_TRACES: Record<string, string[]> = {
  diagnosis: ["diagnose(student=stu_demo_001)", "score_answers(n=9)", "update_mastery(9 kps)", "detect_weak_points(3)"],
  path: ["plan_path(weak=[math_g4_fraction_basic, chinese_g4_reading_main_idea, english_g4_verb_tense])", "check_prerequisites(math_g3_division_meaning)", "rank_tasks(difficulty asc)"],
  chat: ["load_profile(stu_demo_001)", "select_strategy(socratic)", "hint_level=1"],
  reflect: ["reflect(session=diag_20260818)", "adjust_learning_style(visual)"],
};
