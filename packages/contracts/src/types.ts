/**
 * ai-study 前后端共享类型契约（角色 A / E 共用）
 *
 * 与 docs/api/openapi-contract-v0.yaml 一一对应。
 * 任何接口字段变更必须先改 OpenAPI 契约，再同步本文件。
 */

export type Subject = "math" | "chinese" | "english" | "mixed";

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "fill_blank"
  | "short_answer"
  | "dialogue";

export type EmotionState = "happy" | "neutral" | "anxious" | "frustrated";

export type LearningStyle = "visual" | "auditory" | "reading" | "kinesthetic";

export type TaskStatus = "todo" | "doing" | "done";

export type AgentStrategy =
  | "socratic"
  | "explain"
  | "encourage"
  | "review"
  | "reflect";

export type ModelProvider = "spark" | "deepseek" | "qwen" | "minimax" | "mock";

export interface KnowledgePoint {
  id: string;
  subject: Subject;
  grade: number;
  name: string;
  difficulty: number;
  prerequisites?: string[];
  common_misconceptions?: string[];
  resources?: string[];
}

export interface Question {
  id: string;
  subject: Subject;
  grade: number;
  type: QuestionType;
  stem: string;
  options?: string[];
  answer?: string;
  knowledge_point_ids: string[];
  rubric?: string;
  difficulty: number;
}

export interface Answer {
  question_id: string;
  answer: string;
  elapsed_seconds?: number;
}

export interface LearningTask {
  task_id: string;
  subject: Subject;
  title: string;
  knowledge_point_id: string;
  status: TaskStatus;
}

export interface LearningPath {
  student_id: string;
  tasks: LearningTask[];
  reason?: string;
}

export interface StudentProfile {
  student_id: string;
  name: string;
  grade: number;
  mastery: Record<string, number>;
  weak_points: string[];
  emotion_state?: EmotionState;
  learning_style?: LearningStyle;
  updated_at?: string;
}

export interface DiagnosisStartRequest {
  student_id: string;
  grade: number;
  subjects: Subject[];
  count_per_subject?: number;
}

export interface DiagnosisSession {
  session_id: string;
  student_id: string;
  questions: Question[];
}

export interface DiagnosisSubmitRequest {
  session_id: string;
  student_id: string;
  answers: Answer[];
}

export interface DiagnosisResult {
  student_id: string;
  weak_points: string[];
  mastery_updates: Record<string, number>;
  recommended_path: LearningPath;
}

export interface AgentChatRequest {
  student_id: string;
  subject: Subject;
  message: string;
  question_id?: string;
  hint_level?: number;
}

export interface AgentChatResponse {
  reply: string;
  strategy: AgentStrategy;
  suggested_next_question?: string;
  updated_profile: StudentProfile;
  tool_trace?: string[];
}

export interface MistakeRecord {
  mistake_id: string;
  student_id: string;
  question_id: string;
  subject: Subject;
  error_type: string;
  explanation?: string;
  review_count: number;
  next_review_at: string;
}

export interface ReviewItem {
  review_id: string;
  student_id: string;
  subject: Subject;
  question: Question;
  due_reason?: string;
}

export interface ParentReport {
  student_id: string;
  summary: string;
  mastery: Record<string, number>;
  mistake_stats: Record<string, number>;
  suggestions: string[];
}

/** 演示控制台：演示学生元信息（前端本地扩展，非 OpenAPI 字段） */
export interface DemoStudentMeta {
  student_id: string;
  name: string;
  grade: number;
  streak_days: number;
  tagline: string;
}

/** 角色 A：登录注册（学生/家长） */
export type AuthRole = "student" | "parent";

export interface CaptchaResponse {
  captcha_id: string;
  image: string; // data:image/svg+xml;base64,xxx
}

export interface AuthRequest {
  username: string;
  password: string;
  captcha_id: string;
  captcha: string;
}

export interface RegisterRequest extends AuthRequest {
  role: AuthRole;
}

export interface UserInfo {
  user_id: string;
  username: string;
  role: AuthRole;
  display_name: string;
}

export interface MeResponse {
  user_id: string;
  username: string;
  role: AuthRole;
  display_name: string;
  student: {
    student_id: string;
    name: string;
    grade: number;
    mastery: Record<string, number>;
    weak_points: string[];
    emotion_state?: string;
    learning_style?: string;
    updated_at?: string;
  };
}
