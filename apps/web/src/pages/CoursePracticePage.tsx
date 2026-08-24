/** 课程答题页：逐题作答，答错提示重做，全部答对才算完成并解锁下一门。 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { CourseQuestion } from "@contracts";
import { realAnswerCourseQuestion, realCompleteCourse, realGetCourseQuestions } from "@/api/courses";
import { useAppStore } from "@/stores/appStore";

const SUBJECT_LABEL: Record<string, string> = { math: "数学", chinese: "语文", english: "英语" };

export function CoursePracticePage() {
  const { subject = "math", courseId = "" } = useParams();
  const nav = useNavigate();
  const { studentId, setCompanion } = useAppStore();

  const [questions, setQuestions] = useState<CourseQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [cur, setCur] = useState(0);
  const [input, setInput] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = await realGetCourseQuestions(subject, courseId);
      setQuestions(qs);
      setCur(0);
      setCorrectIds(new Set());
      setFeedback(null);
      setInput("");
      setPicked(null);
    } finally {
      setLoading(false);
    }
  }, [subject, courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const q = questions[cur];
  const allDone = useMemo(
    () => questions.length > 0 && correctIds.size === questions.length,
    [correctIds, questions],
  );

  async function submit() {
    const answer = q?.type === "single_choice" ? (picked ?? "") : input.trim();
    if (!answer || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await realAnswerCourseQuestion(subject, courseId, studentId, q.id, answer);
      setFeedback(res);
      if (res.correct) {
        setCorrectIds((s) => {
          const next = new Set(s);
          next.add(q.id);
          return next;
        });
        setInput("");
        setPicked(null);
      }
    } catch (err) {
      setFeedback({ correct: false, explanation: err instanceof Error ? err.message : "提交失败" });
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    setFeedback(null);
    if (cur + 1 < questions.length) {
      setCur((c) => c + 1);
    } else if (allDone) {
      finish();
    }
  }

  async function finish() {
    setDone(true);
    setCompanion("全对！这一课完成啦 🎉", "success");
    try {
      await realCompleteCourse(subject, courseId, studentId);
    } catch {
      /* 完成标记失败不阻塞跳转 */
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex h-full max-w-2xl items-center justify-center">
        <div className="rounded-2xl bg-white/5 p-6 text-sm text-muted-foreground ring-1 ring-white/10">加载中…</div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-4">
        <div className="text-6xl">🎉</div>
        <div className="text-2xl font-black text-foreground">课程完成！</div>
        <p className="text-sm text-muted-foreground">全部答对，下一门课程已解锁。</p>
        <button
          onClick={() => nav(`/learn?subject=${subject}`)}
          className="mt-2 rounded-xl bg-gradient-to-b from-[hsl(24,100%,72%)] to-[hsl(18,98%,53%)] px-8 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90"
        >
          返回学习进度
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-4 py-2">
      {/* 进度头 */}
      <div className="flex items-center justify-between text-sm">
        <div className="font-semibold text-foreground">
          {SUBJECT_LABEL[subject]} ·{" "}
          {courseId.includes("oral")
            ? subject === "math"
              ? "口算"
              : "基础练习"
            : subject === "math"
              ? "应用题"
              : "综合拓展"}
        </div>
        <div className="text-muted-foreground">
          {Math.min(cur + 1, questions.length)}/{questions.length} · 已答对 {correctIds.size} 题
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[hsl(24,100%,72%)] to-[hsl(18,98%,53%)] transition-all"
          style={{ width: `${(correctIds.size / questions.length) * 100}%` }}
        />
      </div>

      {/* 题目卡片 */}
      {q && (
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="mb-4 text-lg font-semibold leading-relaxed text-foreground">{q.stem}</div>

          {q.type === "single_choice" && q.options ? (
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const label = String.fromCharCode(65 + i);
                const active = picked === label;
                const showCorrect = feedback !== null && feedback.correct === false && active;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => !feedback && setPicked(label)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      showCorrect
                        ? "border-rose-400 bg-rose-500/10 text-rose-300"
                        : active
                          ? "border-[hsl(18,98%,53%)] bg-[hsl(18,98%,53%)]/10 text-foreground"
                          : "border-white/15 bg-white/5 text-foreground hover:border-[hsl(18,98%,53%)]/50"
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                      {label}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !feedback && submit()}
              placeholder="输入答案后回车提交"
              disabled={!!feedback}
              className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[hsl(18,98%,53%)] disabled:opacity-60"
            />
          )}

          {/* 反馈 */}
          {feedback && (
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                feedback.correct
                  ? "bg-subject-english/10 text-subject-english ring-1 ring-subject-english/30"
                  : "bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30"
              }`}
            >
              <div className="font-bold">{feedback.correct ? "✓ 回答正确！" : "✗ 答错了，再试一次"}</div>
              {feedback.explanation && <div className="mt-1 text-xs opacity-80">{feedback.explanation}</div>}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="mt-5 flex justify-end">
            {feedback ? (
              feedback.correct ? (
                <button
                  onClick={next}
                  className="rounded-xl bg-gradient-to-b from-[hsl(24,100%,72%)] to-[hsl(18,98%,53%)] px-8 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90"
                >
                  {cur + 1 < questions.length ? "下一题 ›" : allDone ? "完成课程 ✓" : "下一题 ›"}
                </button>
              ) : (
                <button
                  onClick={() => setFeedback(null)}
                  className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-white/15 transition hover:bg-white/15"
                >
                  重新作答
                </button>
              )
            ) : (
              <button
                onClick={submit}
                disabled={submitting || !(q.type === "single_choice" ? picked : input.trim())}
                className="rounded-xl bg-gradient-to-b from-[hsl(24,100%,72%)] to-[hsl(18,98%,53%)] px-8 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "判题中…" : "提交答案"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
