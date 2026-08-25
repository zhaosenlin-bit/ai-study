/**
 * AI 互动课堂：课程生成器（角色 E）
 *
 * 参考 OpenMAIC 课堂形态：一个知识点 = 一堂课，按阶段流转
 *   intro（开场）→ teach（讲解）→ ask（引导提问互动）→ quiz（知识库小测验）→ done（总结）
 *
 * 数据源：apps/web/public/knowledge/{subject}/g{grade}.json（教材知识库）
 * 课堂内容由本地模板基于知识点字段（名称/难度/易错点/前置）生成，
 * 不依赖后端即可完整演示；后续可替换为 AI 实时生成。
 */
import type { GradeKnowledgePoint } from "@/lib/knowledge";
import { COMPANION } from "@/config/companion";
import { SUBJECT_META } from "@/lib/subjects";
import type { Question, Subject } from "@contracts";

export type LessonStageType = "intro" | "teach" | "ask" | "quiz" | "done";

export interface LessonStage {
  type: LessonStageType;
  /** 顶部阶段名（进度条显示） */
  title: string;
  /** AI 老师说的话（气泡文案，驱动 AiCompanion） */
  teacherSay: string;
  /** 讲解正文（teach 阶段展示的要点列表） */
  content?: string[];
  /** 引导问题（ask 阶段） */
  prompt?: string;
  /** 测验题（quiz 阶段，每道题一个 stage） */
  question?: Question;
}

export interface Lesson {
  kp: GradeKnowledgePoint;
  subject: Subject;
  grade: number;
  questions: Question[];
  stages: LessonStage[];
}

const STAR = (n: number) => "★".repeat(n) + "☆".repeat(Math.max(0, 3 - n));

/** 从知识库题库筛选本知识点题目：单选优先，最多 3 道 */
function pickQuestions(questions: Question[], kpId: string, limit = 3): Question[] {
  const related = questions.filter((q) =>
    q.knowledge_point_ids.includes(kpId),
  );
  const ordered = [...related].sort((a, b) => {
    const rank = (t: string) => (t === "single_choice" ? 0 : t === "fill_blank" ? 1 : 2);
    return rank(a.type) - rank(b.type);
  });
  return ordered.slice(0, limit);
}

/** 生成一堂课：阶段序列 intro/teach/ask/quiz×N/done */
export function buildLesson(opts: {
  kp: GradeKnowledgePoint;
  questions: Question[];
  subject: Subject;
  grade: number;
}): Lesson {
  const { kp, questions, subject, grade } = opts;
  const quiz = pickQuestions(questions, kp.id);
  const subj = SUBJECT_META[subject].label;
  const diffStars = STAR(kp.difficulty);
  const misconception = kp.common_misconceptions?.[0];

  const stages: LessonStage[] = [];

  // 1. 开场
  stages.push({
    type: "intro",
    title: "开场",
    teacherSay: `欢迎来到「${kp.name}」小课堂！我是 ${COMPANION.name}，今天我们只用几分钟，把「${kp.name}」彻底搞定！`,
  });

  // 2. 讲解
  const teachContent = [
    `「${kp.name}」是 ${grade} 年级${subj}里非常核心的一个知识点（难度 ${diffStars}）。`,
    "我们先不急着背——先想一想：生活里哪些地方会用到它？带着这个疑问往下学，印象更深。",
  ];
  if (kp.prerequisites?.length) {
    teachContent.push("它是在之前学过的内容基础上延伸出来的，如果你觉得有点吃力，随时告诉我，我帮你复习前置知识。");
  }
  if (misconception) {
    teachContent.push(`⚠️ 老师提醒：不少同学会在「${misconception}」上栽跟头，等会儿做题时特别留意这一点。`);
  }
  stages.push({
    type: "teach",
    title: "老师讲解",
    teacherSay: `来，我们先认识一下「${kp.name}」。你准备好了吗？`,
    content: teachContent,
  });

  // 3. 引导提问
  stages.push({
    type: "ask",
    title: "互动提问",
    teacherSay: "现在轮到你啦！用你自己的话，说说你觉得这个知识点最关键的是什么？",
    prompt: `「${kp.name}」最关键的要点是什么？用你自己的话说一说，我来帮你补充。`,
  });

  // 4. 小测验（每道题一个阶段）
  for (const q of quiz) {
    stages.push({
      type: "quiz",
      title: "小测验",
      teacherSay: "来试试这道题！答完我会马上告诉你对不对，并讲解原因。",
      question: q,
    });
  }

  // 5. 完成总结（答对率由页面传入，此处先放占位文案，页面在 done 阶段动态覆盖）
  stages.push({
    type: "done",
    title: "完成",
    teacherSay: `今天的「${kp.name}」课堂到这里就结束啦！你做得怎么样？`,
  });

  return { kp, subject, grade, questions: quiz, stages };
}

/** 根据答对率生成完成阶段的总结文案 */
export function doneSummary(
  kp: GradeKnowledgePoint,
  correct: number,
  total: number,
): string {
  if (total === 0) {
    return `今天的「${kp.name}」课堂到这里结束啦！记住：学习就像玩游戏，多试几次就会越来越熟练。下次再来挑战吧！`;
  }
  const ratio = correct / total;
  if (ratio === 1) {
    return `太棒了！${correct}/${total} 全对，你把「${kp.name}」稳稳拿下！🎉 记得复习的时候也可以多举几个生活中的例子。`;
  }
  if (ratio >= 0.5) {
    return `不错哦！${correct}/${total} 答对，你已经掌握了「${kp.name}」的大部分内容。把错题的解析再看一遍，就完全没问题啦！`;
  }
  return `没关系，${correct}/${total}。学习就是不断尝试的过程，看看错题解析，搞清楚卡在哪里，我们下次再战！`;
}

/** 学生对引导问题的点评（本地模板；关键词可后续替换为 AI 点评） */
export function askFeedback(
  kp: GradeKnowledgePoint,
  reply: string,
): string {
  const trimmed = reply.trim();
  if (trimmed.length < 4) {
    return `没关系，第一次说不上来很正常的。我提示一下：留意「${kp.name}」里的关键细节，${kp.common_misconceptions?.[0] ? `比如别在「${kp.common_misconceptions[0]}」上出错` : "多想想它在生活里的用处"}。我们直接做题来感受一下！`;
  }
  return `说得不错！你能说出自己的想法就很棒。记住「${kp.name}」的核心要点，我们来做几道题巩固一下！`;
}
