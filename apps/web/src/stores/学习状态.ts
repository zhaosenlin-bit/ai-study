import { create } from "zustand";
import type {
  Answer,
  DiagnosisResult,
  Question,
} from "@contracts";

interface LearningState {
  /** 诊断会话 */
  sessionId: string | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  /** 诊断结果（提交后生成画像与路径） */
  result: DiagnosisResult | null;
  /** 最近一次 Agent 工具痕迹（演示控制台展示用） */
  lastToolTrace: string[];

  startSession: (sessionId: string, questions: Question[]) => void;
  setAnswer: (questionId: string, value: string) => void;
  goNext: () => void;
  goPrev: () => void;
  finishDiagnosis: (result: DiagnosisResult) => void;
  setToolTrace: (trace: string[]) => void;
  reset: () => void;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  sessionId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  result: null,
  lastToolTrace: [],

  startSession: (sessionId, questions) =>
    set({ sessionId, questions, currentIndex: 0, answers: {}, result: null }),

  setAnswer: (questionId, value) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: value } })),

  goNext: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  goPrev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 });
  },

  finishDiagnosis: (result) => set({ result }),

  setToolTrace: (lastToolTrace) => set({ lastToolTrace }),

  reset: () =>
    set({ sessionId: null, questions: [], currentIndex: 0, answers: {}, result: null, lastToolTrace: [] }),
}));

/** 生成符合 OpenAPI Answer 结构的提交数据 */
export function collectAnswers(answers: Record<string, string>, questions: Question[]): Answer[] {
  return questions
    .filter((q) => answers[q.id])
    .map((q) => ({ question_id: q.id, answer: answers[q.id], elapsed_seconds: 15 }));
}
