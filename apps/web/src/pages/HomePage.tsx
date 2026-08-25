import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { AiCompanion } from "@/components/companion/AiCompanion";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { TopBar } from "@/components/layout/TopBar";
import { LeftRail, RightRail } from "@/components/layout/EdgeRail";
import { cn } from "@/lib/utils";
import { SUBJECT_META } from "@/lib/subjects";
import { loadGradeAll, type GradeKnowledge, type GradeKnowledgePoint } from "@/lib/knowledge";
import { useAppStore } from "@/stores/appStore";
import type { Subject } from "@contracts";

/** 英语为三年级起点，1-2 年级仅展示数学+语文 */
function subjectsOf(grade: number): Subject[] {
  return grade <= 2 ? ["math", "chinese"] : ["math", "chinese", "english"];
}

export function HomePage() {
  const navigate = useNavigate();
  const { studentName, grade } = useAppStore();
  const [picked, setPicked] = useState<Subject>("math");
  // 知识库课程内容：subject -> 该年级内容
  const [content, setContent] = useState<Partial<Record<Subject, GradeKnowledge>> | null>(null);
  const [loading, setLoading] = useState(true);
  const subjects = subjectsOf(grade);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadGradeAll(subjects, grade).then((data) => {
      if (!alive) return;
      setContent(data);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade]);

  function handleStart() {
    navigate("/diagnosis");
  }

  const pickedPoints: GradeKnowledgePoint[] = content?.[picked]?.knowledge_points ?? [];

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background">
      {/* 晴空背景：蓝天 + 太阳 + 白云 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#7ec9f2] via-[#bfe6ff] to-[#eef9ff]" />
        <div className="sky-sun absolute top-20 right-[9%] h-36 w-36 md:h-44 md:w-44" />
        <div
          className="sky-cloud absolute left-[7%] top-[15%] h-6 w-24 opacity-90"
          style={{ animation: "cloud-drift 26s ease-in-out infinite" }}
        />
        <div
          className="sky-cloud absolute right-[27%] top-[30%] h-8 w-32 opacity-80"
          style={{ animation: "cloud-drift 34s ease-in-out 2s infinite" }}
        />
        <div
          className="sky-cloud absolute bottom-[16%] left-[26%] h-5 w-20 opacity-75"
          style={{ animation: "cloud-drift 22s ease-in-out 1s infinite" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#ffe8c2]/70 to-transparent" />
      </div>

      <TopBar />

      <div className="relative flex min-h-0 flex-1">
        <LeftRail />

        <main className="relative min-w-0 flex-1 overflow-y-auto px-4 pt-56 pb-24 md:px-6 md:pt-64 md:pb-6">
          <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-start gap-5 py-4 md:gap-6 md:py-6">
            {/* 诊断卡 */}
            <section className="w-full rounded-3xl border border-border bg-card/85 px-6 py-6 text-center shadow-[0_18px_40px_rgba(217,119,6,0.12)] backdrop-blur-sm md:px-10 md:py-8">
              <h2 className="font-serif-display text-2xl font-bold leading-tight text-foreground md:text-[26px]">
                三科小诊断 · 只要 3 分钟
              </h2>
              <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {grade <= 2
                  ? "一年级、二年级按课标暂未开设英语课（三年级起学），先诊断数学和语文。"
                  : "数学、语文、英语各 3 道题，答完之后，我会根据你的表现更新学习画像，找出薄弱点并生成今天专属学习路径。"}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                {subjects.map((id) => {
                  const meta = SUBJECT_META[id];
                  const active = picked === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPicked(id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition active:scale-95",
                        active
                          ? meta.chipClass + " shadow-sm"
                          : "border-border bg-white/70 text-muted-foreground hover:border-primary/30",
                      )}
                      aria-pressed={active}
                    >
                      <span aria-hidden className="text-base leading-none">{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e8830c] px-7 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(217,119,6,0.38)] transition hover:bg-[#d97706] active:scale-95"
                >
                  <span aria-hidden>🚀</span>
                  开始诊断 <ArrowRight size={17} strokeWidth={2.6} />
                </button>
              </div>
            </section>

            {/* 知识库课程内容：按年级加载（诊断卡下方） */}
            <section className="w-full rounded-3xl border border-border bg-card/85 px-5 py-5 shadow-[0_14px_32px_rgba(217,119,6,0.08)] backdrop-blur-sm md:px-7 md:py-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-base font-black text-foreground">
                  <BookOpen size={17} className="text-[#e8830c]" />
                  {grade} 年级课程内容
                  <span className="rounded-full bg-[#e8830c]/10 px-2 py-0.5 text-[11px] font-bold text-[#b45309]">
                    教材知识库
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/diagnosis")}
                  className="text-xs font-semibold text-[#e8830c] transition hover:underline"
                >
                  去诊断 → 
                </button>
              </div>

              {loading ? (
                <p className="mt-4 text-sm text-muted-foreground">正在从知识库加载课程内容…</p>
              ) : pickedPoints.length ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subjects.map((id) => {
                      const meta = SUBJECT_META[id];
                      const active = picked === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPicked(id)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition active:scale-95",
                            active
                              ? meta.chipClass + " shadow-sm"
                              : "border-border bg-white/70 text-muted-foreground hover:border-primary/30",
                          )}
                          aria-pressed={active}
                        >
                          {meta.icon} {meta.label}
                        </button>
                      );
                    })}
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {pickedPoints.slice(0, 8).map((kp) => (
                      <li key={kp.id}>
                        <button
                          type="button"
                          onClick={() => navigate(`/classroom/${picked}/${kp.id}`)}
                          className="group flex w-full items-start gap-2.5 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-left transition hover:border-[#e8830c]/40 hover:bg-[#e8830c]/5"
                        >
                          <span
                            className={cn(
                              "mt-1 h-2 w-2 shrink-0 rounded-full",
                              SUBJECT_META[kp.subject].dotClass,
                            )}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-foreground">
                              {kp.name}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <span aria-hidden>
                                {"★".repeat(Math.max(1, kp.difficulty))}
                                {"☆".repeat(Math.max(0, 3 - Math.min(3, kp.difficulty)))}
                              </span>
                              {kp.source === "textbook_framework" ? "北师大版教材" :
                               kp.source === "textbook_toc" ? "统编版教材" : "知识图谱"}
                            </span>
                          </span>
                          <ArrowRight
                            size={14}
                            className="mt-1 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-[#e8830c]"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11px] text-muted-foreground/80">
                    共 {pickedPoints.length} 个知识点 · 点击知识点可与 AI 伙伴一起学
                  </p>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  本年级课程内容加载失败，请稍后重试。
                </p>
              )}
            </section>

            <p className="text-center text-xs text-muted-foreground/80">
              跟随 AI 伙伴完成诊断，找出薄弱点
            </p>
          </div>
        </main>

        <RightRail />
      </div>
      <BottomTabBar />

      {/* AI 伙伴 + 气泡：固定浮动在视口顶部中央（TopBar 下方），不受 main 滚动影响 */}
      <div className="pointer-events-none fixed left-1/2 top-[68px] z-30 -translate-x-1/2 flex flex-col items-center gap-3">
        <AiCompanion size={100} showBubble={false} />
        <div className="glass-panel animate-pop relative max-w-[420px] rounded-2xl px-5 py-3 text-center text-base font-medium leading-relaxed text-foreground/95">
          你好呀，{studentName}！你现在是 {grade} 年级，今天想先攻克哪一科？
          <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-t border-l border-border bg-card/70" />
        </div>
      </div>
    </div>
  );
}
