import { useAppStore } from "@/stores/应用状态";
import { COMPANION, type CompanionState } from "@/config/伙伴配置";

/** 伙伴状态对应的表情与光效 */
const EYE_STYLE: Record<CompanionState, string> = {
  idle: "",
  greeting: "sparkle",
  thinking: "thinking",
  encourage: "soft",
  success: "happy",
};

export function AI伙伴({
  size = 120,
  showBubble = true,
}: {
  size?: number;
  showBubble?: boolean;
}) {
  const { companionState, companionText, studentName } = useAppStore();

  const bubbleText =
    companionState === "greeting"
      ? COMPANION.greeting(studentName)
      : companionText || COMPANION.stateText[companionState];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 语音气泡 */}
      {showBubble && (
        <div
          key={bubbleText}
          className="glass-panel animate-pop relative max-w-[420px] rounded-2xl px-5 py-3 text-center text-base font-medium leading-relaxed text-foreground/95"
        >
          {bubbleText}
          <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-card/70" />
        </div>
      )}

      {/* 精灵本体 */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* 呼吸光环 */}
        <span className="absolute inset-0 rounded-full bg-primary/25 blur-xl" />
        {/* 思考/激励时的脉冲圈 */}
        {(companionState === "thinking" || companionState === "encourage") && (
          <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-primary/50" />
        )}

        {/* SVG 形象 */}
        <svg
          viewBox="0 0 120 120"
          className="relative animate-float"
          width={size}
          height={size}
          role="img"
          aria-label={`${COMPANION.name} 精灵`}
        >
          <defs>
            <linearGradient id="companion-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="55%" stopColor="#7c5cf0" />
              <stop offset="100%" stopColor="#5b8def" />
            </linearGradient>
            <radialGradient id="companion-glow" cx="0.5" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 身体：圆润的星星 */}
          <path
            d="M60 8 L72 34 L100 38 L80 60 L86 90 L60 74 L34 90 L40 60 L20 38 L48 34 Z"
            fill="url(#companion-body)"
            stroke="#c4b5fd"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* 高光 */}
          <path
            d="M60 16 L68 34 L88 37 L73 53 L77 74 L60 63 L43 74 L47 53 L32 37 L52 34 Z"
            fill="url(#companion-glow)"
          />

          {/* 表情 */}
          {EYE_STYLE[companionState] === "thinking" ? (
            <g>
              <circle cx="47" cy="52" r="4.5" fill="#1e1b4b" />
              <circle cx="73" cy="52" r="4.5" fill="#1e1b4b" />
              <circle cx="47" cy="50" r="1.6" fill="#fff" />
              <circle cx="73" cy="50" r="1.6" fill="#fff" />
            </g>
          ) : (
            <g>
              <ellipse cx="47" cy="53" rx="5.5" ry="6.5" fill="#1e1b4b" />
              <ellipse cx="73" cy="53" rx="5.5" ry="6.5" fill="#1e1b4b" />
              <circle cx="49" cy="50.5" r="2" fill="#fff" />
              <circle cx="75" cy="50.5" r="2" fill="#fff" />
            </g>
          )}

          {/* 嘴巴 */}
          {companionState === "success" || companionState === "greeting" ? (
            <path
              d="M48 68 Q60 80 72 68"
              fill="none"
              stroke="#1e1b4b"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M50 70 Q60 64 70 70"
              fill="none"
              stroke="#1e1b4b"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}

          {/* 腮红（激励/成功时更明显） */}
          <circle cx="38" cy="64" r="4" fill="#fda4af" opacity={companionState === "encourage" ? 0.9 : 0.55} />
          <circle cx="82" cy="64" r="4" fill="#fda4af" opacity={companionState === "encourage" ? 0.9 : 0.55} />

          {/* 思考省略号 */}
          {companionState === "thinking" && (
            <g fill="#c4b5fd">
              <circle cx="60" cy="96" r="2.5" />
              <circle cx="68" cy="98" r="3" />
              <circle cx="77" cy="94" r="2" />
            </g>
          )}
          {/* 成功星星 */}
          {companionState === "success" && (
            <g fill="#fde68a">
              <path d="M20 22 l3 6 6 1 -4.5 4.5 1 6.5 -5.5 -3 -5.5 3 1 -6.5 -4.5 -4.5 6 -1 Z" />
              <path d="M96 18 l2.5 5 5 1 -3.8 3.8 0.8 5.5 -4.5 -2.5 -4.5 2.5 0.8 -5.5 -3.8 -3.8 5 -1 Z" />
            </g>
          )}
        </svg>

        {/* 名称标签 */}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/40 px-3 py-0.5 text-xs font-bold text-primary-foreground backdrop-blur">
          {COMPANION.name}
        </span>
      </div>
    </div>
  );
}
