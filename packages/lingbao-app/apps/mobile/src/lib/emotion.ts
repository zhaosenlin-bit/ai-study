// 桥接 emotion-ball 原生 JS 引擎到 Vue
// 参考:emotion-ball README 的最小接入规范

export interface PetOptions {
  bodyShape?: "blob" | "wedge" | "gem";
  themeColor?: string;
  size?: number;
  wireframe?: boolean;
}

declare global {
  interface Window {
    EmotionBall: any;
  }
}

export class PetEmotion {
  private instance: any;

  constructor(container: HTMLElement, options: PetOptions = {}) {
    if (typeof window.EmotionBall !== "function") {
      throw new Error("EmotionBall not loaded — ensure engine.js, ball.js, emotions.js, rings.js are imported");
    }
    const size = options.size ?? (Math.min(container.clientWidth, container.clientHeight) || 280);
    this.instance = new window.EmotionBall(container, {
      bodyShape: options.bodyShape ?? "blob",
      themeColor: options.themeColor ?? "#7e8cff",
      size,
      wireframe: options.wireframe ?? false,
      autoRender: true,
    });
  }

  set(emotionId: number) {
    if (typeof this.instance?.setEmotion === "function") {
      this.instance.setEmotion(emotionId);
    }
  }

  destroy() {
    if (typeof this.instance?.destroy === "function") {
      this.instance.destroy();
    } else if (this.instance?.container) {
      this.instance.container.innerHTML = "";
    }
  }
}

// 情绪 ID 常量(来自 emotion-ball README 的分段式 emotionId)
// 注意:必须标注 number,否则会被推为字面量类型,导致其他 emotionId 不能赋值给同一 ref
export const Emotion: Record<string, number> = {
  SLEEP: 0,
  WAKE_UP: 2,
  IDLE: 5,
  WELCOME: 9,
  CURIOUS: 11,
  HAPPY: 12,
  EXCITED: 13,
  SURPRISED: 14,
  SHY: 16,
  PROUD: 17,
  CHEERING: 19,
  THINKING: 30,
  SEARCHING: 31,
  WRITING: 32,
  ENCOURAGING: 33,
  FOCUSED: 35,
  CONFUSED: 36,
  CELEBRATING: 38,
  COMPLETE: 39,
  SPEAKING: 41,
  ERROR: 45,
  GOODBYE: 8,
};