import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Home, RotateCcw, Volume2, VolumeX, XCircle } from "lucide-react";
import { AiCompanion } from "@/components/companion/AiCompanion";
import { QuestionCard } from "@/components/question/QuestionCard";
import { TextbookViewer } from "@/components/textbook/TextbookViewer";
import { Textarea } from "@/components/ui/textarea";
import { loadGradeKnowledge } from "@/lib/knowledge";
import { askFeedback, buildLesson, doneSummary, type Lesson, type LessonStageType } from "@/lib/classroom";
import { textbooksFor } from "@/lib/textbooks";
import { speak, stopSpeaking } from "@/lib/tts";
import { useAppStore } from "@/stores/appStore";
import { SUBJECT_META } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import type { Question, Subject } from "@contracts";

/** 判分：单选直接比对；多选排序后比对；填空忽略大小写与空格 */
function checkAnswer(q: Question, answer: string): boolean {
  const a = answer.trim().toLowerCase();
  if (q.type === "multiple_choice") {
    const norm = (s: string) =>
      s.split(",").map((x) => x.trim().toLowerCase()).sort().join(",");
    return norm(a) === norm(String(q.answer ?? ""));
  }
  return a === String(q.answer ?? "").trim().toLowerCase();
}

/** 场景类型 → 图标（OpenMAIC scene 导航风格） */
const STAGE_ICONS: Record<LessonStageType, string> = {
  intro: "👋",
  teach: "📖",
  ask: "💬",
  quiz: "📝",
  done: "🏆",
};

export function ClassroomPage() {
  const { subject = "math", kpId = "" } = useParams<{ subject: string; kpId: string }>();
  const navigate = useNavigate();
  const { grade, setCompanion } = useAppStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [stageIndex, setStageIndex] = useState(0);
  // 老师语音开关（默认开）
  const [soundOn, setSoundOn] = useState(true);
  // 知识点在年级列表中的位置（用于教材页等分定位）
  const [kpIndex, setKpIndex] = useState(0);
  const [kpCount, setKpCount] = useState(0);

  // ask 阶段
  const [askReply, setAskReply] = useState("");
  const [askFeedbackText, setAskFeedbackText] = useState<string | null>(null);
  // quiz 阶段
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [quizChecked, setQuizChecked] = useState(false);

  // 加载知识库并构建课堂
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setStageIndex(0);
    setAskReply("");
    setAskFeedbackText(null);
    setQuizAnswers({});
    setQuizResults({});
    setQuizChecked(false);
    (async () => {
      const data = await loadGradeKnowledge(subject as Subject, grade);
      if (!alive) return;
      const kp = data?.knowledge_points.find((k) => k.id === kpId);
      setKpIndex(data?.knowledge_points.findIndex((k) => k.id === kpId) ?? 0);
      setKpCount(data?.knowledge_points.length ?? 0);
      setLesson(data && kp
        ? buildLesson({ kp, questions: data.questions, subject: subject as Subject, grade })
        : null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, kpId, grade]);

  const stage = lesson?.stages[stageIndex];

  // 阶段变化 → 驱动 AI 老师说话 + 朗读
  useEffect(() => {
    if (!lesson || !stage) return;
    if (stage.type === "done") {
      const correct = Object.values(quizResults).filter(Boolean).length;
      const summary = doneSummary(lesson.kp, correct, lesson.questions.length);
      setCompanion(summary, "success");
      if (soundOn) speak(summary);
    } else {
      const state = stage.type === "teach" ? "thinking" : "idle";
      setCompanion(stage.teacherSay, state);
      if (soundOn) speak(stage.teacherSay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex, lesson, soundOn]);

  // 离开页面停止朗读
  useEffect(() => () => stopSpeaking(), []);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
        <span className="animate-pulse text-4xl" aria-hidden>📚</span>
        <p>AI 老师正在备课…</p>
      </div>
    );
  }

  if (!lesson || !stage) {
    return (
      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="text-4xl" aria-hidden>🧩</span>
        <p className="text-muted-foreground">这节课暂时没准备好，换个知识点试试吧。</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-full bg-[#e8830c] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d97706] active:scale-95"
        >
          <Home size={15} /> 回首页
        </button>
      </div>
    );
  }

  const meta = SUBJECT_META[subject as Subject];
  const isLastQuiz = stage.type === "quiz" && stageIndex === lesson.stages.length - 2;
  const correctCount = Object.values(quizResults).filter(Boolean).length;

  // 场景解锁：intro/teach 开放，ask 需提交，quiz 需前题判分，done 需全部判分
  const quizCount = lesson.questions.length;
  function isUnlocked(i: number): boolean {
    if (i <= 1) return true;
    if (i === 2) return !!askFeedbackText;
    const quizStart = 3;
    if (i < quizStart + quizCount) {
      const needed = i - quizStart;
      if (needed === 0) return !!askFeedbackText;
      return Object.keys(quizResults).length >= needed;
    }
    return Object.keys(quizResults).length === quizCount;
  }

  function goNext() {
    if (!lesson) return;
    setStageIndex((i) => Math.min(i + 1, lesson.stages.length - 1));
  }

  function submitAsk() {
    if (!lesson || !askReply.trim()) return;
    setAskFeedbackText(askFeedback(lesson.kp, askReply));
  }

  function submitQuiz() {
    if (!stage?.question) return;
    const q = stage.question;
    const answer = quizAnswers[q.id] ?? "";
    if (!answer.trim()) return;
    setQuizResults((prev) => ({ ...prev, [q.id]: checkAnswer(q, answer) }));
    setQuizChecked(true);
  }

  function restart() {
    setStageIndex(0);
    setAskReply("");
    setAskFeedbackText(null);
    setQuizAnswers({});
    setQuizResults({});
    setQuizChecked(false);
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl items-start gap-4 pb-4">
      {/* 左侧场景导航（OpenMAIC scene-sidebar 风格，桌面端显示） */}
      <aside className="hidden w-36 shrink-0 md:block">
        <nav aria-label="课堂场景" className="sticky top-2 flex w-full flex-col gap-1 rounded-2xl border border-border bg-white/70 p-2 backdrop-blur-md">
          <p className="px-2 pb-1 pt-1 text-[11px] font-bold text-muted-foreground">课堂场景</p>
          {lesson.stages.map((s, i) => {
            const active = i === stageIndex;
            const unlocked = isUnlocked(i);
            const done = i < stageIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => unlocked && setStageIndex(i)}
                disabled={!unlocked}
                title={unlocked ? s.title : "先完成前面的场景"}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition",
                  active
                    ? "border border-primary/40 bg-primary/10 text-primary"
                    : done
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60",
                  !unlocked && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="shrink-0 text-sm" aria-hidden>
                  {active ? STAGE_ICONS[s.type] : done ? "✅" : unlocked ? STAGE_ICONS[s.type] : "🔒"}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 右侧主体 */}
      <div className="flex min-w-0 flex-1 flex-col items-center gap-5 md:gap-6">
      {/* 顶部：返回 + 学科/知识点 + 进度 */}
      <div className="w-full">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="返回"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/70 text-muted-foreground transition hover:border-primary/30 hover:text-primary active:scale-95"
          >
            <ArrowLeft size={16} strokeWidth={2.4} />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-base font-black text-foreground md:text-lg">
              {meta.icon} {lesson.kp.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {grade} 年级 · {meta.label} · AI 互动课堂
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* 老师语音开关 */}
            <button
              type="button"
              onClick={() => {
                setSoundOn((v) => {
                  if (v) stopSpeaking();
                  return !v;
                });
              }}
              aria-label={soundOn ? "关闭老师语音" : "开启老师语音"}
              title={soundOn ? "关闭老师语音" : "开启老师语音"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/70 text-muted-foreground transition hover:border-primary/30 hover:text-primary active:scale-95"
            >
              {soundOn ? (
                <Volume2 size={16} strokeWidth={2.4} />
              ) : (
                <VolumeX size={16} strokeWidth={2.4} />
              )}
            </button>
            <span className="rounded-full bg-[#e8830c]/10 px-2.5 py-1 text-[11px] font-bold text-[#b45309]">
              {stageIndex + 1}/{lesson.stages.length}
            </span>
          </div>
        </div>
        {/* 进度条 */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-[#e8830c] transition-all duration-500"
            style={{ width: `${((stageIndex + 1) / lesson.stages.length) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-center text-[11px] font-semibold text-muted-foreground">
          {stage.title}
        </p>
      </div>

      {/* AI 老师（自带气泡显示说的话） */}
      <AiCompanion size={96} />

      {/* 阶段内容 */}
      {stage.type === "teach" && stage.content && (
        <div className="w-full space-y-4">
          <div className="glass-panel animate-fade-up w-full space-y-3 p-5 text-left">
            {stage.content.map((line, i) => (
              <p key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                <span className="mt-0.5 shrink-0 text-[#e8830c]" aria-hidden>
                  {i === 0 ? "🎯" : i === stage.content!.length - 1 ? "⚠️" : "✨"}
                </span>
                <span>{line}</span>
              </p>
            ))}
          </div>
          {/* 教材原页：参考教材资料，可切换教材、翻页浏览 */}
          <TextbookViewer
            textbooks={textbooksFor(subject, grade)}
            kpIndex={kpIndex}
            kpCount={kpCount}
          />
        </div>
      )}

      {stage.type === "ask" && (
        <div className="glass-panel animate-fade-up w-full space-y-3 p-5 text-left">
          <p className="text-sm font-semibold text-foreground">💬 {stage.prompt}</p>
          <Textarea
            placeholder="在这里写下你的想法…（说出你理解的关键点即可）"
            value={askReply}
            onChange={(e) => setAskReply(e.target.value)}
            rows={3}
            disabled={!!askFeedbackText}
            className="text-sm"
          />
          {askFeedbackText ? (
            <p className="rounded-xl bg-[#e8830c]/8 px-3.5 py-2.5 text-sm leading-relaxed text-foreground/90">
              {askFeedbackText}
            </p>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitAsk}
                disabled={!askReply.trim()}
                className="rounded-full bg-[#e8830c] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#d97706] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                提交我的回答
              </button>
            </div>
          )}
        </div>
      )}

      {stage.type === "quiz" && stage.question && (
        <div className="flex w-full flex-col items-center gap-4">
          <QuestionCard
            question={stage.question}
            value={quizAnswers[stage.question.id] ?? ""}
            onChange={(v) => {
              setQuizAnswers((prev) => ({ ...prev, [stage.question!.id]: v }));
              setQuizChecked(false);
            }}
          />
          {quizChecked && (
            <div
              className={cnResult(
                "animate-scale-in w-full rounded-2xl border px-4 py-3 text-sm leading-relaxed",
                quizResults[stage.question.id]
                  ? "border-emerald-300/60 bg-emerald-50 text-emerald-800"
                  : "border-red-300/60 bg-red-50 text-red-800",
              )}
            >
              <p className="flex items-center gap-1.5 font-bold">
                {quizResults[stage.question.id] ? (
                  <>
                    <CheckCircle2 size={16} /> 回答正确！
                  </>
                ) : (
                  <>
                    <XCircle size={16} /> 再想想哦
                    {stage.question.answer ? `（正确答案：${stage.question.answer}）` : ""}
                  </>
                )}
              </p>
              {stage.question.explanation && (
                <p className="mt-1.5 leading-relaxed opacity-90">{stage.question.explanation}</p>
              )}
            </div>
          )}
        </div>
      )}

      {stage.type === "done" && (
        <div className="glass-panel animate-fade-up w-full space-y-4 p-6 text-center">
          <div className="text-5xl" aria-hidden>
            {correctCount === lesson.questions.length ? "🎉" : correctCount > 0 ? "😊" : "💪"}
          </div>
          <div className="text-2xl tracking-widest text-[#e8830c]">
            {"★".repeat(Math.max(1, correctCount))}
            {"☆".repeat(Math.max(0, 3 - Math.max(1, correctCount)))}
          </div>
          <p className="text-sm font-semibold text-foreground">
            答对 {correctCount}/{lesson.questions.length} 题
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 active:scale-95"
            >
              <RotateCcw size={14} /> 再学一遍
            </button>
            <button
              type="button"
              onClick={() => navigate("/diagnosis")}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 active:scale-95"
            >
              去诊断
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#e8830c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d97706] active:scale-95"
            >
              <Home size={14} /> 回首页
            </button>
          </div>
        </div>
      )}

      {/* 底部操作按钮 */}
      {stage.type === "intro" && (
        <button
          type="button"
          onClick={goNext}
          className="inline-flex items-center gap-2 rounded-full bg-[#e8830c] px-7 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(217,119,6,0.38)] transition hover:bg-[#d97706] active:scale-95"
        >
          开始上课 <ArrowRight size={17} strokeWidth={2.6} />
        </button>
      )}
      {stage.type === "teach" && (
        <button
          type="button"
          onClick={goNext}
          className="inline-flex items-center gap-2 rounded-full bg-[#e8830c] px-7 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(217,119,6,0.38)] transition hover:bg-[#d97706] active:scale-95"
        >
          我听懂啦，继续 <ArrowRight size={17} strokeWidth={2.6} />
        </button>
      )}
      {stage.type === "ask" && askFeedbackText && (
        <button
          type="button"
          onClick={goNext}
          className="inline-flex items-center gap-2 rounded-full bg-[#e8830c] px-7 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(217,119,6,0.38)] transition hover:bg-[#d97706] active:scale-95"
        >
          继续做小测验 <ArrowRight size={17} strokeWidth={2.6} />
        </button>
      )}
      {stage.type === "quiz" && stage.question && (
        quizChecked ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-2 rounded-full bg-[#e8830c] px-7 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(217,119,6,0.38)] transition hover:bg-[#d97706] active:scale-95"
          >
            {isLastQuiz ? "看课堂总结 🎓" : "下一题"} <ArrowRight size={17} strokeWidth={2.6} />
          </button>
        ) : (
          <button
            type="button"
            onClick={submitQuiz}
            disabled={!(quizAnswers[stage.question.id] ?? "").trim()}
            className="inline-flex items-center gap-2 rounded-full bg-[#e8830c] px-7 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(217,119,6,0.38)] transition hover:bg-[#d97706] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            提交答案
          </button>
        )
      )}
      </div>
    </div>
  );
}

/** 简单结果样式辅助（避免额外依赖） */
function cnResult(base: string, extra: string): string {
  return `${base} ${extra}`;
}
