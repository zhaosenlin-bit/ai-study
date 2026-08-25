import { useState } from "react";
import { ArrowLeft, ArrowRight, Home, RotateCcw, XCircle } from "lucide-react";
import { QuestionCard } from "@/components/question/QuestionCard";
import { loadGradeKnowledge } from "@/lib/knowledge";
import { useAppStore } from "@/stores/appStore";
import { SUBJECT_META } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import type { Question, Subject } from "@contracts";

const SUBJECTS: Subject[] = ["math", "chinese", "english"];
const QUIZ_SIZE = 30;

/** 简单洗牌：从知识库随机抽 30 道（不足 30 则全取） */
function pickRandom(questions: Question[], size: number): Question[] {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, size);
}

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

type Stage = "select" | "in_progress" | "done";

export function WeeklyQuizPage() {
  const { grade } = useAppStore();
  const [subject, setSubject] = useState<Subject>("math");
  const [stage, setStage] = useState<Stage>("select");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startQuiz() {
    setLoading(true);
    setError(null);
    try {
      const data = await loadGradeKnowledge(subject, grade);
      if (!data || data.questions.length === 0) {
        setError(`${grade} 年级${SUBJECT_META[subject].label}题库暂未准备就绪。`);
        setLoading(false);
        return;
      }
      setQuestions(pickRandom(data.questions, QUIZ_SIZE));
      setAnswers({});
      setResults({});
      setCurrentIndex(0);
      setStage("in_progress");
    } catch {
      setError("题库加载失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setAnswers({});
    setResults({});
    setCurrentIndex(0);
    setStage("in_progress");
    // 重新随机抽题
    loadGradeKnowledge(subject, grade).then((data) => {
      if (data) setQuestions(pickRandom(data.questions, QUIZ_SIZE));
    });
  }

  function changeSubject() {
    setStage("select");
    setAnswers({});
    setResults({});
    setQuestions([]);
    setCurrentIndex(0);
  }

  // --- 选科（默认进入）---
  if (stage === "select") {
    return (
      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center gap-6 py-6 md:py-10">
        <div className="text-center">
          <h1 className="font-serif-display text-3xl font-bold text-foreground md:text-[36px]">
            📝 每周小测
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            {grade} 年级 · 每科 30 道题 · 知识库随机抽题
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {SUBJECTS.map((s) => {
            const meta = SUBJECT_META[s];
            const active = subject === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95",
                  active ? meta.chipClass + " shadow-sm" : "border-border bg-white/70 text-muted-foreground hover:border-primary/30",
                )}
                aria-pressed={active}
              >
                <span aria-hidden className="text-base leading-none">{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={startQuiz}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-[#e8830c] px-8 py-3.5 text-base font-bold text-white shadow-[0_10px_24px_rgba(217,119,6,0.38)] transition hover:bg-[#d97706] active:scale-95 disabled:opacity-50"
        >
          🚀 开始 30 道挑战
        </button>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
    );
  }

  // --- 答题中 ---
  if (stage === "in_progress") {
    const q = questions[currentIndex];
    const total = questions.length;
    const answered = Object.keys(answers).filter((id) => (answers[id] ?? "").trim()).length;
    const meta = SUBJECT_META[subject];
    return (
      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center gap-4 pb-4">
        <div className="w-full">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={changeSubject}
              aria-label="返回选科"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/70 text-muted-foreground transition hover:border-primary/30 hover:text-primary active:scale-95"
            >
              <ArrowLeft size={16} strokeWidth={2.4} />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <h1 className="truncate text-base font-black text-foreground md:text-lg">
                📝 {meta.icon} {meta.label} · 每周小测
              </h1>
              <p className="text-xs text-muted-foreground">{grade} 年级 · 知识库抽题</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#e8830c]/10 px-2.5 py-1 text-[11px] font-bold text-[#b45309]">
              {currentIndex + 1}/{total}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-[#e8830c] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
            已答 {answered} / {total}
          </p>
        </div>
        {q ? (
          <div className="flex w-full flex-col items-center gap-3">
            <QuestionCard
              question={q}
              value={answers[q.id] ?? ""}
              onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={14} /> 上一题
              </button>
              {currentIndex < total - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#e8830c] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#d97706] active:scale-95"
                >
                  下一题 <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    // 提交：判分所有题
                    const next: Record<string, boolean> = { ...results };
                    questions.forEach((qq) => {
                      next[qq.id] = checkAnswer(qq, answers[qq.id] ?? "");
                    });
                    setResults(next);
                    setStage("done");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#e8830c] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#d97706] active:scale-95"
                >
                  交卷查看结果
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">题目加载中…</p>
        )}
      </div>
    );
  }

  // --- 完成总结 ---
  const total = questions.length;
  const correct = Object.values(results).filter(Boolean).length;
  const wrong = total - correct;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const meta = SUBJECT_META[subject];
  const wrongList = questions.filter((q) => results[q.id] === false);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center gap-5 pb-4">
      <div className="glass-panel animate-fade-up w-full space-y-4 p-6 text-center">
        <div className="text-5xl" aria-hidden>
          {accuracy === 100 ? "🎉" : accuracy >= 80 ? "😊" : accuracy >= 60 ? "💪" : "📚"}
        </div>
        <h1 className="font-serif-display text-2xl font-bold text-foreground md:text-[28px]">
          {meta.icon} {meta.label} · 本周小测
        </h1>
        <p className="text-sm text-muted-foreground">{grade} 年级 · 知识库抽题</p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-2xl font-black text-emerald-700">{correct}</p>
            <p className="text-xs text-emerald-700/80">答对</p>
          </div>
          <div className="rounded-xl bg-red-50 p-3">
            <p className="text-2xl font-black text-red-700">{wrong}</p>
            <p className="text-xs text-red-700/80">答错</p>
          </div>
          <div className="rounded-xl bg-[#e8830c]/10 p-3">
            <p className="text-2xl font-black text-[#b45309]">{accuracy}%</p>
            <p className="text-xs text-[#b45309]">正确率</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 active:scale-95"
          >
            <RotateCcw size={14} /> 再来一组
          </button>
          <button
            type="button"
            onClick={changeSubject}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 active:scale-95"
          >
            换学科
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e8830c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d97706] active:scale-95"
          >
            <Home size={14} /> 回首页
          </a>
        </div>
      </div>
      {wrongList.length > 0 && (
        <div className="glass-panel w-full space-y-3 p-5 text-left">
          <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <XCircle size={15} className="text-red-600" /> 错题回顾（{wrongList.length}）
          </p>
          <ul className="space-y-2.5">
            {wrongList.slice(0, 5).map((q) => (
              <li key={q.id} className="rounded-xl border border-border bg-white/70 p-3 text-xs">
                <p className="font-semibold text-foreground">{q.stem}</p>
                <p className="mt-1 text-muted-foreground">
                  正确答案：<span className="font-bold text-emerald-700">{q.answer}</span>{" "}
                  · 你的答案：<span className="font-bold text-red-600">{answers[q.id] || "（未作答）"}</span>
                </p>
                {q.explanation && (
                  <p className="mt-1 leading-relaxed text-muted-foreground/90">{q.explanation}</p>
                )}
              </li>
            ))}
            {wrongList.length > 5 && (
              <li className="text-center text-xs text-muted-foreground">
                还有 {wrongList.length - 5} 道错题未显示
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
