/**
 * Mock API 实现：模拟真实接口的延迟与返回结构。
 * 真实 API 就绪后，src/api/index.ts 会切换为 client.ts。
 */
import type {
  AgentChatRequest,
  AgentChatResponse,
  DiagnosisResult,
  DiagnosisSession,
  LearningPath,
  MistakeRecord,
  ParentReport,
  Question,
  StudentProfile,
} from "@contracts";
import {
  CHAT_HINTS,
  DIAGNOSIS_RESULTS,
  MISTAKES,
  PATHS,
  PROFILES,
  QUESTIONS_BY_STUDENT,
  REPORTS,
  TOOL_TRACES,
} from "./mockData";

const LATENCY = 400;

function delay<T>(data: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/**
 * 知识库融合：从 public/knowledge/{subject}/g{grade}.json 加载该年级题目。
 * 数据由 tools/sync_knowledge.py 从 data/question_bank + data/knowledge_graph 聚合生成。
 */
async function loadGradeQuestions(subject: string, grade: number): Promise<Question[]> {
  try {
    const res = await fetch(`/knowledge/${subject}/g${grade}.json`);
    if (!res.ok) return [];
    const data = (await res.json()) as { questions?: Question[] };
    return data.questions ?? [];
  } catch {
    return [];
  }
}

/** 简单随机打乱（诊断题每次出场顺序不同） */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function mockStartDiagnosis(
  studentId: string,
  grade: number,
  subjects: string[],
  countPerSubject = 3,
): Promise<DiagnosisSession> {
  // 优先：按年级从知识库取题（1-6 年级全覆盖）
  const picked: Question[] = [];
  for (const subject of subjects) {
    const qs = shuffle(await loadGradeQuestions(subject, grade));
    picked.push(...qs.slice(0, countPerSubject));
  }
  if (picked.length >= Math.min(countPerSubject, 1)) {
    return delay({
      session_id: `diag_${Date.now()}`,
      student_id: studentId,
      questions: picked,
    });
  }
  // 回退：演示学生静态题库（知识库缺失时兜底）
  const pool = QUESTIONS_BY_STUDENT[studentId] ?? [];
  const questions = pool
    .filter((q) => subjects.includes(q.subject))
    .slice(0, countPerSubject * subjects.length);
  return delay({
    session_id: `diag_${Date.now()}`,
    student_id: studentId,
    questions: questions as Question[],
  });
}

export async function mockSubmitDiagnosis(
  _sessionId: string,
  studentId: string,
  _answers: unknown[],
): Promise<DiagnosisResult> {
  return delay(DIAGNOSIS_RESULTS[studentId] ?? DIAGNOSIS_RESULTS["stu_demo_001"]);
}

export async function mockGetProfile(studentId: string): Promise<StudentProfile> {
  return delay(PROFILES[studentId] ?? PROFILES["stu_demo_001"]);
}

export async function mockGetPath(studentId: string): Promise<LearningPath> {
  return delay(PATHS[studentId] ?? PATHS["stu_demo_001"]);
}

export async function mockGetMistakes(studentId: string): Promise<MistakeRecord[]> {
  return delay(MISTAKES[studentId] ?? MISTAKES["stu_demo_001"]);
}

export async function mockGetReport(studentId: string): Promise<ParentReport> {
  return delay(REPORTS[studentId] ?? REPORTS["stu_demo_001"]);
}

export async function mockAgentChat(req: AgentChatRequest): Promise<AgentChatResponse> {
  const hints = CHAT_HINTS[req.subject] ?? CHAT_HINTS["math"];
  const level = Math.min(req.hint_level ?? 0, hints.length - 1);
  const profile = PROFILES[req.student_id] ?? PROFILES["stu_demo_001"];
  const isCorrect = /对|正确|是|right|correct|goes|went|20|25|15|1\/4|0.6|0.8|apple|watched|想念家乡/i.test(
    req.message,
  );

  let reply: string;
  let strategy: AgentChatResponse["strategy"];
  if (isCorrect) {
    reply = "完全正确！🎉 你掌握得很扎实，我们继续下一题！";
    strategy = "encourage";
  } else {
    const hint = hints.find((h) => h.level === level) ?? hints[0];
    reply = hint.text;
    strategy = "socratic";
  }

  return delay({
    reply,
    strategy,
    suggested_next_question:
      strategy === "encourage" ? "下一道题想挑战一下吗？" : undefined,
    updated_profile: { ...profile, updated_at: new Date().toISOString() },
    tool_trace: TOOL_TRACES["chat"],
  });
}
