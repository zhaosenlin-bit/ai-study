import { create } from "zustand";
import { COMPANION, type CompanionState } from "@/config/companion";
import type { ModelProvider } from "@contracts";
import { DEMO_STUDENTS } from "@/api/mockData";

interface AppState {
  studentId: string;
  studentName: string;
  streakDays: number;
  modelProvider: ModelProvider;
  companionState: CompanionState;
  companionText: string;
  setStudent: (studentId: string) => void;
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

  setModelProvider: (modelProvider) => set({ modelProvider }),

  setCompanion: (companionText, companionState = "idle") =>
    set({ companionText, companionState }),

  bumpStreak: () => set((s) => ({ streakDays: s.streakDays + 1 })),
}));
