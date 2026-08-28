/**
 * API 门面：一键切换 mock / 真实接口。
 * VITE_USE_MOCK=true（默认）走内置 mock；false 走 FastAPI。
 */
import type {
  AgentChatRequest,
  AgentChatResponse,
  DailyAnswerItem,
  DailyDiagnosisResult,
  DiagnosisResult,
  DiagnosisSession,
  LearningPath,
  MistakeRecord,
  ParentReport,
  StudentProfile,
  TodayDiagnosis,
} from "@contracts";
import {
  apiGet,
  apiPost,
  apiPostForm,
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
    USE_MOCK ? mockSubmitDiagnosis(sessionId, studentId, answers) : realSubmitDiagnosis(sessionId, studentId, answers),
  /** 拍照改卷：上传图片 + AI 批改 */
  uploadPractice: (studentId: string, subject: string, note: string, selfCorrect: boolean, file: File): Promise<{ practice_id: string; subject: string; ai_feedback: string; image_path: string }> => {
    const fd = new FormData();
    fd.append("student_id", studentId);
    fd.append("subject", subject);
    fd.append("note", note);
    fd.append("self_correct", String(selfCorrect));
    fd.append("file", file);
    return apiPostForm("/api/v1/practice/upload", fd);
  },
  /** 拍照改卷历史 */
  listPractices: (studentId: string): Promise<{ practice_id: string; subject: string; image_path: string; note: string; self_correct: number; ai_feedback: string; created_at: string }[]> =>
    apiGet(`/api/v1/practice/list?student_id=${studentId}`),
  /** 长期记忆知识库：写入一条记忆 */
  addMemory: (studentId: string, kind: string, content: string, meta?: Record<string, unknown>): Promise<{ kind: string; content: string }> =>
    apiPost("/api/v1/memory", { student_id: studentId, kind, content, meta: meta ?? {} }),
  /** 长期记忆知识库：语义检索 */
  searchMemory: (studentId: string, query: string, topK = 5): Promise<{ query: string; hits: { content: string; kind: string; score: number }[] }> =>
    apiPost("/api/v1/memory/search", { student_id: studentId, query, top_k: topK }),
  /** AI 伴学画像：读取（长期记忆，用于个性化） */
  getAiProfile: (studentId: string): Promise<Record<string, string>> =>
    apiGet(`/api/v1/students/${studentId}/ai-profile`),
  /** AI 伴学画像：保存问卷/谈心记录 */
  saveAiProfile: (studentId: string, answers: { key: string; value: string }[]): Promise<Record<string, string>> =>
    apiPost("/api/v1/students/ai-profile", { student_id: studentId, answers }),
  /** 今日诊断：六类题型（每天一套），已诊断则返回结果 */
  todayDiagnosis: (studentId: string, grade: number): Promise<TodayDiagnosis> =>
    apiGet(`/api/v1/diagnosis/today?student_id=${studentId}&grade=${grade}`),
  /** 提交每日诊断：判分 + 弱项识别 + 错题入本 */
  submitDailyDiagnosis: (studentId: string, grade: number, answers: DailyAnswerItem[]): Promise<DailyDiagnosisResult> =>
    apiPost("/api/v1/diagnosis/daily-submit", { student_id: studentId, grade, answers }),
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
