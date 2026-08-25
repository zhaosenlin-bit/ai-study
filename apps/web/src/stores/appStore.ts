import { create } from "zustand";
import { COMPANION, type CompanionState } from "@/config/companion";
import type { ModelProvider } from "@contracts";
import { DEMO_STUDENTS } from "@/api/mockData";

/** 会话过期时长（小时）：每隔这么久没打开网站，再次访问需重新登录 */
const SESSION_HOURS = 4;
const SESSION_MS = SESSION_HOURS * 60 * 60 * 1000;
/** 登录态存储键（"记住我" → localStorage，否则 sessionStorage） */
const AUTH_KEY = "ai-study-auth";
/** 年级偏好存储键（独立于登录态，跨会话保留） */
const GRADE_KEY = "ai-study-grade";

/** 存储结构：学生 ID + 登录时间戳 */
interface StoredAuth {
  sid: string;
  at: number;
}

/** 读取持久化的年级偏好（1-6），无效返回 null */
export function readGrade(): number | null {
  const raw = localStorage.getItem(GRADE_KEY) ?? sessionStorage.getItem(GRADE_KEY);
  if (!raw) return null;
  const g = Number.parseInt(raw, 10);
  return Number.isInteger(g) && g >= 1 && g <= 6 ? g : null;
}

function readAuth(): StoredAuth | null {
  const raw =
    localStorage.getItem(AUTH_KEY) ?? sessionStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    return typeof parsed?.sid === "string" && typeof parsed?.at === "number"
      ? (parsed as StoredAuth)
      : null;
  } catch {
    return null;
  }
}

/** 判断登录态是否已过期（供路由守卫每次进入时复查） */
export function isSessionExpired(): boolean {
  const auth = readAuth();
  return auth ? Date.now() - auth.at > SESSION_MS : true;
}

/** 初始化：恢复未过期的登录态，过期则清除 */
function initAuth(): { isLoggedIn: boolean; studentId: string } {
  const auth = readAuth();
  if (auth && Date.now() - auth.at <= SESSION_MS) {
    return { isLoggedIn: true, studentId: auth.sid };
  }
  if (auth) {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
  }
  return { isLoggedIn: false, studentId: "stu_demo_001" };
}

interface AppState {
  studentId: string;
  studentName: string;
  streakDays: number;
  /** 当前学年（1-6），登录页选择，持久化保留 */
  grade: number;
  modelProvider: ModelProvider;
  companionState: CompanionState;
  companionText: string;
  /** AI 情绪观察产生的表情 emotionId（优先级高于 companionState 映射，null 时回落） */
  moodEmotion: string | null;
  /** 是否已登录（未登录仅浏览公开页，登录后可进入学习空间） */
  isLoggedIn: boolean;
  setStudent: (studentId: string) => void;
  /** 切换年级（同步持久化） */
  setGrade: (grade: number) => void;
  setModelProvider: (provider: ModelProvider) => void;
  setCompanion: (text: string, state?: CompanionState) => void;
  /** AI 情绪观察：设置伙伴表情，null 恢复为状态映射表情 */
  setMoodEmotion: (emotionId: string | null) => void;
  /** 仅演示控制台使用：强制更新学习状态 */
  bumpStreak: () => void;
  /** 登录：remember=true 持久化到 localStorage，否则仅本次会话 */
  login: (studentId: string, remember?: boolean, displayName?: string) => void;
  logout: () => void;
}

function metaOf(studentId: string) {
  return DEMO_STUDENTS.find((s) => s.student_id === studentId) ?? DEMO_STUDENTS[0];
}

const initial = initAuth();
const initialMeta = metaOf(initial.studentId);

export const useAppStore = create<AppState>((set) => ({
  studentId: initial.studentId,
  studentName: initialMeta.name,
  streakDays: initialMeta.streak_days,
  grade: readGrade() ?? initialMeta.grade,
  modelProvider: "mock",
  companionState: "greeting",
  companionText: COMPANION.greeting(initialMeta.name),
  moodEmotion: null,
  isLoggedIn: initial.isLoggedIn,

  setStudent: (studentId) => {
    const meta = metaOf(studentId);
    set({
      studentId,
      studentName: meta.name,
      streakDays: meta.streak_days,
      companionState: "greeting",
      companionText: COMPANION.greeting(meta.name),
      moodEmotion: null,
    });
  },

  setGrade: (grade) => {
    localStorage.setItem(GRADE_KEY, String(grade));
    sessionStorage.setItem(GRADE_KEY, String(grade));
    set({ grade });
  },

  setModelProvider: (modelProvider) => set({ modelProvider }),

  setCompanion: (companionText, companionState = "idle") =>
    set({ companionText, companionState }),

  setMoodEmotion: (moodEmotion) => set({ moodEmotion }),

  bumpStreak: () => set((s) => ({ streakDays: s.streakDays + 1 })),

  login: (studentId, remember = true, displayName) => {
    const meta = metaOf(studentId);
    const name = displayName || meta.name;
    set({
      isLoggedIn: true,
      studentId,
      studentName: name,
      streakDays: meta.streak_days,
      companionState: "greeting",
      companionText: COMPANION.greeting(name),
      moodEmotion: null,
    });
    (remember ? localStorage : sessionStorage).setItem(
      AUTH_KEY,
      JSON.stringify({ sid: studentId, at: Date.now() } satisfies StoredAuth),
    );
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    set({ isLoggedIn: false });
  },
}));
