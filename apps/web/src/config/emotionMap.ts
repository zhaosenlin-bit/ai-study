/**
 * 表情映射：把业务状态 / AI 情绪标签映射到 Emotion Ball 的 emotionId。
 *
 * emotionId 分段规则（来自 emotion-ball/js/emotions.js）：
 *   00-09 生命周期 · 10-29 情绪反应 · 30-49 代理工作状态 · 50+ 自定义
 */
import type { CompanionState } from "@/config/companion";

/** 业务状态 → 表情 */
export const STATE_TO_EMOTION: Record<CompanionState, string> = {
  idle: "02", // 待机放空
  greeting: "10", // 开心
  thinking: "30", // 思考中
  encourage: "19", // 满意（温柔鼓励）
  success: "33", // 任务完成（撒花）
};

/** MiniMax 情绪观察输出的情绪标签 */
export type MoodTag =
  | "happy"
  | "excited"
  | "sad"
  | "angry"
  | "tired"
  | "confused"
  | "frustrated"
  | "curious"
  | "focused"
  | "anxious"
  | "neutral";

/** 情绪标签 → 表情 */
export const MOOD_TO_EMOTION: Record<MoodTag, string> = {
  happy: "10", // 开心
  excited: "13", // 惊讶（兴奋）
  sad: "12", // 失落
  angry: "21", // 生气
  tired: "15", // 疲惫
  confused: "11", // 疑惑
  frustrated: "17", // 慌张（受挫）
  curious: "03", // 好奇
  focused: "16", // 专注
  anxious: "17", // 慌张（紧张）
  neutral: "02", // 待机放空
};

/** 情绪标签 → 中文名（演示展示用） */
export const MOOD_LABEL_ZH: Record<MoodTag, string> = {
  happy: "开心",
  excited: "兴奋",
  sad: "失落",
  angry: "生气",
  tired: "疲惫",
  confused: "困惑",
  frustrated: "受挫",
  curious: "好奇",
  focused: "专注",
  anxious: "紧张",
  neutral: "平静",
};

/** 情绪观察结果 */
export interface MoodResult {
  /** 情绪标签 */
  emotion: MoodTag;
  /** 情绪强度 0~1 */
  intensity: number;
}
