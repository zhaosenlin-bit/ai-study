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

export async function mockStartDiagnosis(
  studentId: string,
  _grade: number,
  subjects: string[],
  countPerSubject = 3,
): Promise<DiagnosisSession> {
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
