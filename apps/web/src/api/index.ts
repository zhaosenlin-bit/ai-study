/**
 * API 门面：一键切换 mock / 真实接口。
 * VITE_USE_MOCK=true（默认）走内置 mock；false 走 FastAPI。
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
import {
  realAgentChat,
  realGetMistakes,
  realGetPath,
  realGetProfile,
  realGetReport,
  realStartDiagnosis,
  realSubmitDiagnosis,
} from "./client";
import {
  mockAgentChat,
  mockGetMistakes,
  mockGetPath,
  mockGetProfile,
  mockGetReport,
  mockStartDiagnosis,
  mockSubmitDiagnosis,
} from "./mockApi";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const api = {
  startDiagnosis: (studentId: string, grade: number, subjects: string[], count?: number): Promise<DiagnosisSession> =>
    USE_MOCK ? mockStartDiagnosis(studentId, grade, subjects, count) : realStartDiagnosis(studentId, grade, subjects, count),
  submitDiagnosis: (sessionId: string, studentId: string, answers: unknown[]): Promise<DiagnosisResult> =>
    USE_MOCK ? mockSubmitDiagnosis(sessionId, studentId, answers) : realSubmitDiagnosis(sessionId, studentId, answers),
  getProfile: (studentId: string): Promise<StudentProfile> =>
    USE_MOCK ? mockGetProfile(studentId) : realGetProfile(studentId),
  getPath: (studentId: string): Promise<LearningPath> =>
    USE_MOCK ? mockGetPath(studentId) : realGetPath(studentId),
  getMistakes: (studentId: string): Promise<MistakeRecord[]> =>
    USE_MOCK ? mockGetMistakes(studentId) : realGetMistakes(studentId),
  getReport: (studentId: string): Promise<ParentReport> =>
    USE_MOCK ? mockGetReport(studentId) : realGetReport(studentId),
  agentChat: (req: AgentChatRequest): Promise<AgentChatResponse> =>
    USE_MOCK ? mockAgentChat(req) : realAgentChat(req),
};
