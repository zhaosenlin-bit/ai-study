import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { subjectMeta } from "@/lib/subjects";
import { useAppStore } from "@/stores/appStore";
import { useMemoryStore } from "@/stores/memoryStore";
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

export function ChatPage() {
  const { subject = "math" } = useParams();
  const [searchParams] = useSearchParams();
  const taskTitle = searchParams.get("title") ?? "";
  const taskKp = searchParams.get("kp") ?? "";
  const { studentId, studentName, setCompanion } = useAppStore();
  const getFacts = useMemoryStore((s) => s.getFacts);
  const extractFromChat = useMemoryStore((s) => s.extractFromChat);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [showTrace, setShowTrace] = useState(false);
  const [newFactsCount, setNewFactsCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const taskPrefixedRef = useRef(false);
  const navigate = useNavigate();

  const meta = subjectMeta(subject);

  // 进入学科时生成 AI 开场（任务化时优先针对该任务开场；带记忆的问候）
  useEffect(() => {
    const knownFacts = getFacts(studentId);
    const nick = knownFacts.find((f) => f.key === "nickname")?.value;
    const fav = knownFacts.find((f) => f.key === "fav_subject")?.value;
    const weak = knownFacts.find((f) => f.key === "weak_point")?.value;
    const greetName = nick || studentName;
    const memoryHint =
      knownFacts.length > 0
        ? `\n\n（我记着：${[
            fav ? `你喜欢 ${fav === "math" ? "数学" : fav === "chinese" ? "语文" : "英语"}` : null,
            weak ? `你 ${weak} 觉得有点卡` : null,
          ]
            .filter(Boolean)
            .join("；")}。有变化随时告诉我哦～）`
        : "";

    const greeting = taskTitle
      ? `你好呀，${greetName}！今天我们要一起做：「${taskTitle}」${
          taskKp ? `（${taskKp}）` : ""
        }。从你最有把握的地方开始说，遇到卡点直接告诉我，我会用三步提示陪你一步步想出来～${memoryHint}`
      : `你好呀，${greetName}！我是你的 AI 学习伙伴，今天我们一起来学${meta.label}。有问题随时问我，我会引导你自己想明白，不会直接告诉你答案哦。${memoryHint}`;
    setMessages([
      {
        role: "ai",
        text: greeting,
        strategy: "socratic",
      },
    ]);
    setHintLevel(0);
    setInput(taskTitle ? `我想做「${taskTitle}」，从哪里开始？` : "");
    setCompanion(
      taskTitle ? `今天我们一起做：${taskTitle}` : "我们开始吧！先告诉我你在哪里卡住了？",
      "greeting",
    );
    taskPrefixedRef.current = !!taskTitle;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, studentId, taskTitle]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
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
      // 长期记忆：从用户消息 + AI 回复里提取认知入库
      const newFacts = extractFromChat(studentId, text, res.reply);
      if (newFacts.length > 0) {
        setNewFactsCount(newFacts.length);
        window.setTimeout(() => setNewFactsCount(0), 4000);
      }
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
      {/* 长期记忆提示 + 档案入口 */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => navigate("/memory")}
          className="flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-white/70 px-3 py-1 text-foreground transition hover:bg-amber-50"
        >
          <span>🧠</span>
          <span>小熊的认知档案（{getFacts(studentId).length} 条）</span>
        </button>
        {newFactsCount > 0 && (
          <div className="animate-fade-in rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
            🐻 刚记住 {newFactsCount} 条新信息～
          </div>
        )}
      </div>
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
            <div className="rounded-2xl bg-gradient-to-r from-sky-100 via-sky-50 to-amber-50 p-4 shadow-sm">
              <p className="mb-3 text-sm text-muted-foreground">
                直接回答我：想学什么？做测试？聊天？
              </p>
              <div className="flex gap-2">
                <Textarea
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
                  className="bg-white"
                />
                <Button
                  size="lg"
                  className="self-end rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground shadow-[0_4px_12px_rgba(249,116,21,0.35)] hover:brightness-110"
                  disabled={sending || !input.trim()}
                  onClick={() => void handleSend()}
                >
                  回答
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { icon: "🧸", label: "认识我", to: null as string | null, prompt: "你是什么 AI？介绍一下你自己～" },
                  { icon: "📝", label: "做测试", to: "/diagnosis", prompt: null },
                  { icon: "💬", label: "聊聊天", to: null, prompt: "和我随便聊聊吧～" },
                  { icon: "🧠", label: "知识库", to: "/textbook", prompt: null },
                  { icon: "📕", label: "错题", to: "/mistakes", prompt: null },
                  { icon: "📅", label: "学习计划", to: "/path", prompt: null },
                ].map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => {
                      if (q.to) navigate(q.to);
                      else if (q.prompt) setInput(q.prompt);
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-white"
                  >
                    <span aria-hidden>{q.icon}</span>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：精灵 + 痕迹 */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel flex flex-col items-center gap-2 p-4">
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
