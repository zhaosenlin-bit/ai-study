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
} from "./请求客户端";
import {
  mockAgentChat,
  mockGetMistakes,
  mockGetPath,
  mockGetProfile,
  mockGetReport,
  mockStartDiagnosis,
  mockSubmitDiagnosis,
} from "./模拟接口";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const api = {
  startDiagnosis: (studentId: string, grade: number, subjects: string[], count?: number): Promise<DiagnosisSession> =>
    USE_MOCK ? mockStartDiagnosis(studentId, grade, subjects, count) : realStartDiagnosis(studentId, grade, subjects, count),
  submitDiagnosis: (sessionId: string, studentId: string, answers: unknown[]): Promise<DiagnosisResult> =>
    apiPost("/api/v1/diagnosis/submit", { session_id: sessionId, student_id: studentId, answers }),
  /** 今日诊断：六类题型（每天一套），已诊断则返回结果 */
  todayDiagnosis: (studentId: string, grade: number): Promise<TodayDiagnosis> =>
    apiGet(`/api/v1/diagnosis/today?student_id=${studentId}&grade=${grade}`),
  /** 提交每日诊断：判分 + 弱项识别 + 错题入本 */
  submitDailyDiagnosis: (studentId: string, grade: number, answers: DailyAnswerItem[]): Promise<DailyDiagnosisResult> =>
    apiPost("/api/v1/diagnosis/daily-submit", { student_id: studentId, grade, answers }),
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
