import { create } from "zustand";
import { COMPANION, type CompanionState } from "@/config/companion";
import type { ModelProvider } from "@contracts";
import { DEMO_STUDENTS } from "@/api/mockData";

/** 登录态存储键（"记住我" → localStorage，否则 sessionStorage） */
const AUTH_KEY = "ai-study-auth";

interface AppState {
  studentId: string;
  studentName: string;
  streakDays: number;
  modelProvider: ModelProvider;
  companionState: CompanionState;
  companionText: string;
  /** AI 情绪观察产生的表情 emotionId（优先级高于 companionState 映射，null 时回落） */
  moodEmotion: string | null;
  /** 是否已登录（未登录仅浏览公开页，登录后可进入学习空间） */
  isLoggedIn: boolean;
  setStudent: (studentId: string) => void;
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

/** 初始化：恢复已保存的登录态 */
function initAuth(): { isLoggedIn: boolean; studentId: string } {
  const saved =
    localStorage.getItem(AUTH_KEY) ?? sessionStorage.getItem(AUTH_KEY);
  return saved
    ? { isLoggedIn: true, studentId: saved }
    : { isLoggedIn: false, studentId: "stu_demo_001" };
}

const initial = initAuth();
const initialMeta = metaOf(initial.studentId);

export const useAppStore = create<AppState>((set) => ({
  studentId: initial.studentId,
  studentName: initialMeta.name,
  streakDays: initialMeta.streak_days,
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
    (remember ? localStorage : sessionStorage).setItem(AUTH_KEY, studentId);
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    set({ isLoggedIn: false });
  },
}));
