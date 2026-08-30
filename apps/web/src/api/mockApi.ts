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
  LearningTask,
  MistakeRecord,
  ParentReport,
  Question,
  StudentProfile,
  TaskStatus,
} from "@contracts";
import {
  CHAT_HINTS,
  DIAGNOSIS_RESULTS,
  MISTAKES,
  PATHS,
  PROFILES,
  QUESTIONS_BY_STUDENT,
  REPORTS,
  TASK_POOL,
  TOOL_TRACES,
} from "./mockData";

const LATENCY = 150;

function delay<T>(data: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/* ================= 每日任务生成 + 进度持久化 ================= */

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function dateStrAdd(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** 按种子从数组里抽 n 个不重复元素 */
function pickN<T>(arr: T[], n: number, seed: number): T[] {
  const used = new Set<number>();
  const out: T[] = [];
  let s = seed | 0;
  while (out.length < n && used.size < arr.length) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % arr.length;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(arr[idx]);
    }
  }
  return out;
}

/** localStorage 进度：{ [studentId]: { [dateStr]: { [task_id]: TaskStatus } } } */
type ProgressMap = Record<string, Record<string, Record<string, TaskStatus>>>;
const PROGRESS_KEY = "ai-study:path-progress:v1";

function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "{}") as ProgressMap;
  } catch {
    return {};
  }
}
function saveProgress(map: ProgressMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
}

/** 给定日期生成当天的 6 个任务（三科各 2） */
function generateDailyTasks(studentId: string, ds: string): LearningTask[] {
  const seed = hashSeed(`${studentId}|${ds}`);
  const subjects = ["math", "chinese", "english"] as const;
  const tasks: LearningTask[] = [];
  subjects.forEach((subj, i) => {
    const picked = pickN(TASK_POOL[subj], 2, seed + i + 1);
    picked.forEach((p, j) => {
      tasks.push({
        task_id: `t_${ds.replace(/-/g, "")}_${subj}_${j}`,
        subject: subj,
        title: p.title,
        knowledge_point_id: p.kpId,
        status: "todo",
      });
    });
  });
  return tasks;
}

/** 给定日期 + 学生，合并 localStorage 进度到默认任务上 */
function applyProgress(studentId: string, ds: string, tasks: LearningTask[]): LearningTask[] {
  const map = loadProgress();
  const dayProgress = map[studentId]?.[ds] ?? {};
  return tasks.map((t) => ({
    ...t,
    status: dayProgress[t.task_id] ?? t.status,
  }));
}

function reasonFor(studentId: string): string {
  return PATHS[studentId]?.reason ?? "今日任务覆盖语数英三科，每日自动刷新以保持均衡训练与新鲜感。";
}

export async function mockStartDiagnosis(
  studentId: string,
  _grade: number,
  subjects: string[],
  countPerSubject = 3,
): Promise<DiagnosisSession> {
  const pool = QUESTIONS_BY_STUDENT[studentId] ?? QUESTIONS_BY_STUDENT["stu_demo_001"] ?? [];
  const questions = pool
    .filter((q) => subjects.includes(q.subject))
    .slice(0, countPerSubject * subjects.length);
  // 诊断题已在内存中，无需延迟；直接返回避免用户感知"准备中..."卡顿
  return {
    session_id: `diag_${Date.now()}`,
    student_id: studentId,
    questions: questions as Question[],
  };
}

export async function mockSubmitDiagnosis(
  _sessionId: string,
  studentId: string,
  _answers: unknown[],
): Promise<DiagnosisResult> {
  return DIAGNOSIS_RESULTS[studentId] ?? DIAGNOSIS_RESULTS["stu_demo_001"];
}

export async function mockGetProfile(studentId: string): Promise<StudentProfile> {
  return delay(PROFILES[studentId] ?? PROFILES["stu_demo_001"]);
}

export async function mockGetPath(studentId: string): Promise<LearningPath> {
  const today = dateStr(new Date());
  const tasks = applyProgress(studentId, today, generateDailyTasks(studentId, today));
  return delay({
    student_id: studentId,
    reason: reasonFor(studentId),
    tasks,
  });
}

/** 返回昨天未完成的任务（昨天有 todo 或 doing 状态的）。 */
export async function mockGetCarryoverTasks(studentId: string): Promise<LearningTask[]> {
  const yesterday = dateStr(dateStrAdd(new Date(), -1));
  const tasks = applyProgress(studentId, yesterday, generateDailyTasks(studentId, yesterday));
  return delay(tasks.filter((t) => t.status !== "done"));
}

/** 写入单个任务状态到 localStorage。 */
export async function mockSetTaskStatus(
  studentId: string,
  taskId: string,
  status: TaskStatus,
  dateOverride?: string,
): Promise<void> {
  const ds = dateOverride ?? dateStr(new Date());
  const map = loadProgress();
  if (!map[studentId]) map[studentId] = {};
  if (!map[studentId][ds]) map[studentId][ds] = {};
  map[studentId][ds][taskId] = status;
  saveProgress(map);
  return delay(undefined);
}

export async function mockGetMistakes(studentId: string): Promise<MistakeRecord[]> {
  return delay(MISTAKES[studentId] ?? MISTAKES["stu_demo_001"]);
}

export async function mockGetReport(studentId: string): Promise<ParentReport> {
  return delay(REPORTS[studentId] ?? REPORTS["stu_demo_001"]);
}

export async function mockAgentChat(req: AgentChatRequest): Promise<AgentChatResponse> {
  const profile = PROFILES[req.student_id] ?? PROFILES["stu_demo_001"];

  // 优先直连真实大模型（线上版无后端也能智能回答）；失败时回退到规则模板。
  try {
    const reply = await directMinimaxChat(req.message, req.subject, req.hint_level ?? 0);
    if (reply) {
      return {
        reply,
        strategy: "socratic",
        updated_profile: { ...profile, updated_at: new Date().toISOString() },
        tool_trace: TOOL_TRACES["chat"],
      };
    }
  } catch {
    /* 直连失败走下方模板 */
  }

  const hints = CHAT_HINTS[req.subject] ?? CHAT_HINTS["math"];
  const level = Math.min(req.hint_level ?? 0, hints.length - 1);
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

const MINIMAX_KEY = import.meta.env.VITE_MINIMAX_KEY ?? "";

/** 浏览器直连 Minimax（线上版无后端时启用；minimax 允许跨域）。 */
export async function directMinimaxChat(
  message: string,
  subject: string,
  hintLevel: number,
): Promise<string> {
  if (!MINIMAX_KEY) return "";
  const roleHints: Record<string, string> = {
    math: "你叫'小星'，是温暖耐心的 AI 数学学习伙伴，专长小学 3-6 年级数学。",
    chinese: "你叫'小星'，是温暖耐心的 AI 语文学习伙伴，专长小学语文。",
    english: "你叫'小星'，是温暖耐心的 AI 英语学习伙伴，专长小学英语。",
  };
  const hintTip = hintLevel ? `这是第 ${hintLevel + 1} 次提示，提示级别越高越具体。` : "";
  const system = `${roleHints[subject] ?? roleHints.math} ${hintTip}\n回答要求：1) 中文 2) 简短（不超过 80 字）3) 像 10 岁孩子的老师一样温暖。`;

  const resp = await fetch("https://api.minimaxi.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MINIMAX_KEY}`,
    },
    body: JSON.stringify({
      model: "abab6.5s-chat",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      max_tokens: 300,
      temperature: 0.6,
    }),
  });
  if (!resp.ok) return "";
  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
