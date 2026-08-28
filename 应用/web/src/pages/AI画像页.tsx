import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { 按钮 } from "@/components/ui/按钮";
import { useAppStore } from "@/stores/应用状态";
import { cn } from "@/lib/工具函数";

/** 画像问卷环节：AI 问、学生选/答 */
const STEPS: { key: string; ask: string; options?: string[]; placeholder?: string }[] = [
  { key: "study_time", ask: "先认识一下～你每天愿意花多长时间学习呢？", options: ["30分钟", "1小时", "2小时", "更多都行"] },
  { key: "study_period", ask: "你喜欢在什么时候学习？", options: ["早上", "下午", "晚上", "不固定"] },
  { key: "interests", ask: "平时最喜欢什么呀？动画、游戏、运动、画画…都可以告诉我～", placeholder: "比如：喜欢看动画片和打篮球" },
  { key: "goals", ask: "这次你最想提高哪一门？", options: ["数学", "语文", "英语", "都想提高"] },
  { key: "study_style", ask: "遇到不会的题，你更喜欢？", options: ["先自己琢磨", "直接问AI", "看讲解示范"] },
  { key: "talk", ask: "最后，跟我聊聊吧：最近学习感觉怎么样？有什么小烦恼或者小心愿吗？", placeholder: "想说什么都可以，我会一直记住～" },
];

export function AI画像页() {
  const nav = useNavigate();
  const { studentId, setCompanion } = useAppStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];

  function pick(value: string) {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      setInput("");
    } else {
      save(next);
    }
  }

  function submitInput() {
    if (!input.trim()) return;
    pick(input.trim());
  }

  async function save(all: Record<string, string>) {
    setSaving(true);
    try {
      await api.saveAiProfile(
        studentId,
        Object.entries(all).map(([key, value]) => ({ key, value })),
      );
      setCompanion("已经记住你啦，今天开始为你定制学习计划！", "encourage");
      nav("/diagnosis/today", { replace: true });
    } finally {
      setSaving(false);
    }
  }

  const done = step >= STEPS.length;

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center gap-4 py-2">
      <AI伙伴 size={72} showBubble={false} />

      {/* AI 气泡 */}
      <div className="w-full">
        <div className="glass-panel animate-pop rounded-2xl px-5 py-4 text-center text-base font-medium leading-relaxed text-foreground/95">
          {done ? "太好了！AI 已经记住你，接下来开始今天的诊断吧～" : current.ask}
          {step > 0 && (
            <div className="mt-2 text-[11px] text-muted-foreground">
              第 {step + 1}/{STEPS.length} 个问题
            </div>
          )}
        </div>
      </div>

      {/* 回答区 */}
      {!done && (
        <div className="w-full space-y-2">
          {current.options ? (
            current.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => pick(opt)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-white/10"
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitInput()}
                placeholder={current.placeholder}
                autoFocus
                className="h-11 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <按钮 onClick={submitInput}>发送</按钮>
            </div>
          )}
        </div>
      )}

      {/* 进度 */}
      <div className="flex w-full gap-1.5">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 rounded-full transition", i <= step ? "bg-primary/70" : "bg-white/10")}
          />
        ))}
      </div>

      {done && !saving && (
        <按钮 onClick={() => nav("/diagnosis/today")} className="h-11 w-full">
          开始今日诊断 →
        </按钮>
      )}
      {saving && <div className="text-sm text-muted-foreground">AI 正在记住你…</div>}
    </div>
  );
}
