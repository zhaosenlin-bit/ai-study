import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/appStore";
import { COMPANION, type CompanionState } from "@/config/companion";
import { STATE_TO_EMOTION } from "@/config/emotionMap";

/** 伙伴状态对应的气泡光效（保留原有视觉） */
const PULSE_STATES: CompanionState[] = ["thinking", "encourage"];

export function AiCompanion({
  size = 120,
  showBubble = true,
  color = "#7c5cf0",
}: {
  size?: number;
  showBubble?: boolean;
  /** 表情球主题色 */
  color?: string;
}) {
  const { companionState, companionText, studentName, moodEmotion } = useAppStore();
  const hostRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<EmotionBallEngine | null>(null);

  const bubbleText =
    companionState === "greeting"
      ? COMPANION.greeting(studentName)
      : companionText || COMPANION.stateText[companionState];

  // 情绪观察优先，否则按业务状态映射
  const emotionId = moodEmotion ?? STATE_TO_EMOTION[companionState];

  // 初始化 Emotion Ball 引擎（public/vendor/emotion-ball）
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !window.EmotionBall) return;
    const ball = window.EmotionBall.create(host, {
      emotion: emotionId,
      color,
      idle: { standbyAfter: 45000, sleepAfter: 120000 },
    });
    ballRef.current = ball;
    return () => {
      ball.destroy();
      ballRef.current = null;
    };
    // 引擎只创建一次，后续表情由下方 effect 切换
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  // 表情切换
  useEffect(() => {
    ballRef.current?.setEmotion(emotionId);
  }, [emotionId]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 语音气泡 */}
      {showBubble && (
        <div
          key={bubbleText}
          className="glass-panel animate-pop relative max-w-[420px] rounded-2xl px-5 py-3 text-center text-base font-medium leading-relaxed text-foreground/95"
        >
          {bubbleText}
          <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-border bg-card/70" />
        </div>
      )}

      {/* 精灵本体 */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* 呼吸光环 */}
        <span className="absolute inset-0 rounded-full bg-primary/25 blur-xl" />
        {/* 思考/激励时的脉冲圈 */}
        {PULSE_STATES.includes(companionState) && (
          <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-primary/50" />
        )}

        {/* Emotion Ball 表情球（引擎注入 SVG，占满容器） */}
        <div
          ref={hostRef}
          className="relative"
          style={{ width: size, height: size }}
          role="img"
          aria-label={`${COMPANION.name} 精灵`}
        />

        {/* 名称标签 */}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-white/85 px-3 py-0.5 text-xs font-bold text-leaf backdrop-blur">
          {COMPANION.name}
        </span>
      </div>
    </div>
  );
}