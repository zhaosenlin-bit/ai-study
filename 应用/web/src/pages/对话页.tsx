import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/api";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { 按钮 } from "@/components/ui/按钮";
import { 文本域 } from "@/components/ui/文本域";
import { cn } from "@/lib/工具函数";
import { subjectMeta } from "@/lib/学科";
import { useAppStore } from "@/stores/应用状态";
import type { AgentStrategy } from "@contracts";

interface Message {
  role: "ai" | "user";
  text: string;
  strategy?: AgentStrategy;
  trace?: string[];
}

const STRATEGY_LABEL: Record<AgentStrategy, string> = {
  socratic: "分步引导",
  explain: "讲解",
  encourage: "鼓励",
  review: "复习",
  reflect: "反思",
};

const SUBJECTS = ["math", "chinese", "english"] as const;

export function 对话页() {
  const { subject = "math" } = useParams();
  const { studentId, studentName, setCompanion } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);

  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("当前浏览器不支持语音输入，请用 Chrome/Edge");
      return;
    }
    const rec = new SR();
    rec.lang = "zh-CN";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) setInput((v) => (v ? v + text : text));
    };
    rec.onerror = () => setListening(false);
    rec.start();
  }
  const [hintLevel, setHintLevel] = useState(0);
  const [showTrace, setShowTrace] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const meta = subjectMeta(subject);

  // 进入学科时生成 AI 开场
  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: `你好呀，${studentName}！我是你的 AI 学习伙伴，今天我们一起来学${meta.label}。有问题随时问我，我会引导你自己想明白，不会直接告诉你答案哦。`,
        strategy: "socratic",
      },
    ]);
    setHintLevel(0);
    setCompanion("我们开始吧！先告诉我你在哪里卡住了？", "greeting");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, studentId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    // 用户说的话写入长期记忆知识库
    try {
      void api.addMemory(studentId, "chat", text, { subject });
    } catch {
      /* 记忆写入失败不影响对话 */
    }
    setSending(true);
    setMessages((m) => [...m, { role: "user", text }]);
    setCompanion("让我想一想怎么帮你…", "thinking");

    try {
      const res = await api.agentChat({
        student_id: studentId,
        subject: subject as "math" | "chinese" | "english",
        message: text,
        hint_level: hintLevel,
      });
      setMessages((m) => [
        ...m,
        { role: "ai", text: res.reply, strategy: res.strategy, trace: res.tool_trace },
      ]);
      if (res.strategy === "socratic") setHintLevel((h) => Math.min(h + 1, 3));
      setCompanion(
        res.strategy === "encourage" ? "答对啦！继续加油！" : res.reply,
        res.strategy === "encourage" ? "success" : "idle",
      );
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "网络好像开小差了，稍后再试一次吧～", strategy: "encourage" },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4 py-2">
      {/* 学科切换 */}
      <div className="flex items-center gap-2">
        {SUBJECTS.map((s) => {
          const m = subjectMeta(s);
          const active = s === subject;
          return (
            <Link
              key={s}
              to={`/chat/${s}`}
              className={cn(
                "subject-chip border px-3 py-1.5 text-sm transition-all",
                m.chipClass,
                !active && "opacity-45 grayscale hover:opacity-80",
              )}
            >
              {m.icon} {m.label}
            </Link>
          );
        })}
        <button
          onClick={() => setShowTrace((v) => !v)}
          className="ml-auto rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {showTrace ? "隐藏" : "显示"} Agent 痕迹
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
        {/* 对话区 */}
        <div className="glass-panel flex min-h-0 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex animate-fade-in",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "rounded-br-md bg-primary/85 text-primary-foreground"
                      : "rounded-bl-md border border-white/10 bg-white/6 text-foreground/95",
                  )}
                >
                  {msg.role === "ai" && msg.strategy && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          msg.strategy === "encourage"
                            ? "bg-subject-english/20 text-subject-english"
                            : "bg-primary/20 text-primary",
                        )}
                      >
                        {STRATEGY_LABEL[msg.strategy]}
                      </span>
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
                <span className="animate-pulse">AI 伙伴思考中</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                </span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* 输入区 */}
          <div className="border-t border-white/8 p-3">
            <div className="flex gap-2">
              <文本域
                rows={2}
                value={input}
                placeholder={`和${meta.label}有关的任何问题都可以问我…`}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <按钮
                size="lg"
                variant={listening ? "default" : "outline"}
                className="self-end px-3"
                onClick={startVoice}
                title="语音输入"
              >
                {listening ? "🎙️…" : "🎤"}
              </按钮>
              <按钮
                size="lg"
                className="self-end"
                disabled={sending || !input.trim()}
                onClick={() => void handleSend()}
              >
                发送
              </按钮>
            </div>
          </div>
        </div>

        {/* 右侧：精灵 + 痕迹 */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel flex flex-col items-center gap-2 p-4">
            <AI伙伴 size={84} showBubble={false} />
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              {meta.label}辅导中 · 提示层级 {hintLevel + 1}/4
            </p>
          </div>

          {showTrace && (
            <div className="glass-panel p-3">
              <div className="mb-2 text-xs font-bold text-foreground">🛠️ Agent 工具痕迹</div>
              <ul className="space-y-1.5">
                {[
                  `load_profile(${studentId})`,
                  `select_strategy(socratic)`,
                  `hint_level=${hintLevel}`,
                ].map((t, i) => (
                  <li
                    key={i}
                    className="rounded-md bg-black/30 px-2 py-1 font-mono text-[10px] leading-relaxed text-subject-english"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
