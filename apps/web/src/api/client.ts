/**
 * 真实 API 客户端：按 OpenAPI 契约请求后端（角色 A 的 FastAPI）。
 * 当前默认走 mock；VITE_USE_MOCK=false 且后端就绪后启用本文件。
 */
import type {
  AgentChatRequest,
  AgentChatResponse,
  DiagnosisResult,
  DiagnosisSession,
  LearningPath,
  MistakeRecord,
  ParentReport,
  StudentProfile,
} from "@contracts";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return (await res.json()) as T;
}

export async function realStartDiagnosis(
  studentId: string,
  grade: number,
  subjects: string[],
  countPerSubject = 3,
): Promise<DiagnosisSession> {
  return apiFetch<DiagnosisSession>("/api/v1/diagnosis/start", {
    method: "POST",
    body: JSON.stringify({ student_id: studentId, grade, subjects, count_per_subject: countPerSubject }),
  });
}

export async function realSubmitDiagnosis(
  sessionId: string,
  studentId: string,
  answers: unknown[],
): Promise<DiagnosisResult> {
  return apiFetch<DiagnosisResult>("/api/v1/diagnosis/submit", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, student_id: studentId, answers }),
  });
}

export async function realGetProfile(studentId: string): Promise<StudentProfile> {
  return apiFetch<StudentProfile>(`/api/v1/students/${studentId}/profile`);
}

export async function realGetPath(studentId: string): Promise<LearningPath> {
  return apiFetch<LearningPath>(`/api/v1/students/${studentId}/path`);
}

export async function realGetMistakes(studentId: string): Promise<MistakeRecord[]> {
  return apiFetch<MistakeRecord[]>(`/api/v1/students/${studentId}/mistakes`);
}

export async function realGetReport(studentId: string): Promise<ParentReport> {
  return apiFetch<ParentReport>(`/api/v1/reports/parent/${studentId}`);
}

export async function realAgentChat(req: AgentChatRequest): Promise<AgentChatResponse> {
  return apiFetch<AgentChatResponse>("/api/v1/agent/chat", {
    method: "POST",
    body: JSON.stringify(req),
  });
}
