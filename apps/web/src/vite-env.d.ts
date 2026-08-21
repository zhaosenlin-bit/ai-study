/// <reference types="vite/client" />

/** Emotion Ball 表情引擎（public/vendor/emotion-ball，挂载在 window 上） */
interface EmotionBallEngine {
  setEmotion(id: string, opts?: { auto?: boolean }): void;
  handleAIMessage(msg: string | { emotionId?: string; tips?: string }): boolean;
  on(evt: "change" | "tips" | "error", cb: (payload: unknown) => void): EmotionBallEngine;
  off(evt: "change" | "tips" | "error", cb: (payload: unknown) => void): EmotionBallEngine;
  destroy(): void;
}

interface Window {
  /** Emotion Ball 引擎 SDK（加载自 public/vendor/emotion-ball/*.js） */
  EmotionBall?: {
    create(target: HTMLElement | string, opts?: {
      emotion?: string;
      idle?: boolean | Record<string, unknown>;
      color?: string;
      eyeColor?: string;
      eyeScale?: number;
      autostart?: boolean;
      fallbackId?: string;
    }): EmotionBallEngine;
  };
}

interface ImportMetaEnv {
  /** MiniMax API Key（主）—— 情绪观察用，勿提交到仓库 */
  readonly VITE_MINIMAX_API_KEY?: string;
  /** MiniMax API Key（备用，主 key 额度用尽时自动切换） */
  readonly VITE_MINIMAX_API_KEY_BACKUP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}