import { create } from "zustand";
import { COMPANION, type CompanionState } from "@/config/伙伴配置";
import type { ModelProvider } from "@contracts";
import { DEMO_STUDENTS } from "@/api/模拟数据";

export type UserRole = "student" | "parent";

interface AppState {
  studentId: string;
  studentName: string;
  role: UserRole;
  grade: number;
  streakDays: number;
  modelProvider: ModelProvider;
  companionState: CompanionState;
  companionText: string;
  setStudent: (studentId: string) => void;
  setCurrentUser: (input: { userId: string; displayName: string; grade: number; role?: UserRole }) => void;
  setModelProvider: (provider: ModelProvider) => void;
  setCompanion: (text: string, state?: CompanionState) => void;
  /** 仅演示控制台使用：强制更新学习状态 */
  bumpStreak: () => void;
}

function metaOf(studentId: string) {
  return DEMO_STUDENTS.find((s) => s.student_id === studentId) ?? DEMO_STUDENTS[0];
}

export const useAppStore = create<AppState>((set) => ({
  studentId: "stu_demo_001",
  studentName: "小明",
  role: "student",
  grade: 4,
  streakDays: 7,
  modelProvider: "mock",
  companionState: "greeting",
  companionText: COMPANION.greeting("小明"),

  setStudent: (studentId) => {
    const meta = metaOf(studentId);
    set({
      studentId,
      studentName: meta.name,
      streakDays: meta.streak_days,
      companionState: "greeting",
      companionText: COMPANION.greeting(meta.name),
    });
  },

  setCurrentUser: ({ userId, displayName, grade, role = "student" }) => {
    set({
      studentId: userId,
      studentName: displayName,
      role,
      grade,
      streakDays: 0,
      companionState: "greeting",
      companionText: COMPANION.greeting(displayName),
    });
  },

  setModelProvider: (modelProvider) => set({ modelProvider }),

  setCompanion: (companionText, companionState = "idle") =>
    set({ companionText, companionState }),

  bumpStreak: () => set((s) => ({ streakDays: s.streakDays + 1 })),
}));
