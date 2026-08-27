import { create } from "zustand";

/**
 * 演示控制台状态：跨路由持久（演示过程会切换多个页面）。
 */
interface DemoState {
  running: boolean;
  currentStep: number;
  logs: string[];
  setRunning: (running: boolean) => void;
  setCurrentStep: (step: number) => void;
  pushLog: (log: string) => void;
  clearLogs: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  running: false,
  currentStep: -1,
  logs: [],
  setRunning: (running) => set({ running }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  pushLog: (log) => set((s) => ({ logs: [...s.logs, log] })),
  clearLogs: () => set({ logs: [], currentStep: -1, running: false }),
}));
