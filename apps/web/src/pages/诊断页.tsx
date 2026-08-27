import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import { TOOL_TRACES } from "@/api/模拟数据";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { 题目卡片 } from "@/components/question/题目卡片";
import { 徽章 } from "@/components/ui/徽章";
import { 按钮 } from "@/components/ui/按钮";
import { 卡片, 卡片内容 } from "@/components/ui/卡片";
import { 进度条 } from "@/components/ui/进度条";
import { subjectMeta } from "@/lib/学科";
import { useAppStore } from "@/stores/应用状态";
import {
  collectAnswers,
  useLearningStore,
} from "@/stores/学习状态";

export function 诊断页() {
  const navigate = useNavigate();
  const { studentId, grade, setCompanion } = useAppStore();
  const {
    sessionId,
    questions,
    currentIndex,
    answers,
    result,
    startSession,
    setAnswer,
    goNext,
    goPrev,
    finishDiagnosis,
    setToolTrace,
    reset,
  } = useLearningStore();

  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  async function handleStart() {
    setStarting(true);
    setCompanion("开始三科小诊断啦，我会根据你的回答找出薄弱点～", "thinking");
    try {
      const session = await api.startDiagnosis(studentId, grade, ["math", "chinese", "english"], 3);
      startSession(session.session_id, session.questions);
      setToolTrace(TOOL_TRACES["diagnosis"]);
      setCompanion("第一题来啦，慢慢来，不着急！", "greeting");
    } finally {
      setStarting(false);
    }
  }

  async function handleSubmit() {
    if (!sessionId) return;
    setSubmitting(true);
    setCompanion("让我分析一下你的回答…", "thinking");
    try {
      const diagnosis = await api.submitDiagnosis(
        sessionId,
        studentId,
        collectAnswers(answers, questions),
      );
      finishDiagnosis(diagnosis);
      setToolTrace(TOOL_TRACES["path"]);
      setCompanion("太棒了！我已经帮你找到 3 个薄弱点，一起攻克它们吧！", "success");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRestart() {
    reset();
    setCompanion("我们重新来一次诊断吧！", "greeting");
  }

  /* ---------- 结果页 ---------- */
  if (result) {
    const weakKps = result.recommended_path.tasks
      .filter((t) => t.status === "todo")
      .slice(0, 3);
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-6 py-6">
        <AI伙伴 size={100} />
        <卡片 className="w-full animate-fade-in">
          <卡片内容 className="space-y-5 p-6">
            <div>
              <h2 className="mb-1 text-xl font-black text-foreground">
                诊断完成，画像已更新 🎉
              </h2>
              <p className="text-sm text-muted-foreground">
                检测到 {result.weak_points.length} 个薄弱知识点，已为你生成今日学习路径。
              </p>
            </div>

            <div>
              <div className="mb-2 text-sm font-bold text-foreground">薄弱点</div>
              <div className="flex flex-wrap gap-2">
                {result.weak_points.map((w) => {
                  const meta = subjectMeta(w.split("_")[0]);
                  return (
                    <徽章 key={w} className={`border ${meta.chipClass}`}>
                      {meta.icon} {w}
                    </徽章>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-bold text-foreground">推荐学习任务</div>
              <div className="space-y-2">
                {weakKps.map((t, i) => {
                  const meta = subjectMeta(t.subject);
                  return (
                    <div
                      key={t.task_id}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
                      <span className="text-sm font-semibold text-foreground">{t.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{meta.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <按钮 size="lg" onClick={() => navigate("/path")}>
                🗺️ 查看学习路径
              </按钮>
              <按钮
                size="lg"
                variant="outline"
                onClick={() => navigate("/chat/math")}
              >
                🧑‍🏫 先去辅导薄弱点
              </按钮>
              <按钮 size="lg" variant="ghost" onClick={handleRestart}>
                重新诊断
              </按钮>
            </div>
          </卡片内容>
        </卡片>
      </div>
    );
  }

  /* ---------- 进行中 ---------- */
  if (questions.length) {
    const q = questions[currentIndex];
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-5 py-6">
        {/* 进度 */}
        <div className="flex w-full max-w-2xl items-center gap-3">
          <span className="text-sm font-bold text-foreground">
            {currentIndex + 1}/{questions.length}
          </span>
          <进度条 value={progress} className="flex-1" />
          <span className="text-xs text-muted-foreground">已答 {answeredCount} 题</span>
        </div>

        <题目卡片
          question={q}
          value={answers[q.id] ?? ""}
          onChange={(v) => setAnswer(q.id, v)}
        />

        <div className="flex w-full max-w-2xl items-center justify-between gap-3">
          <按钮 variant="ghost" size="lg" disabled={currentIndex === 0} onClick={goPrev}>
            ← 上一题
          </按钮>
          {isLast ? (
            <按钮
              size="lg"
              disabled={submitting || answeredCount < questions.length}
              onClick={handleSubmit}
            >
              {submitting ? "分析中…" : "✅ 提交诊断"}
            </按钮>
          ) : (
            <按钮 size="lg" onClick={goNext}>
              下一题 →
            </按钮>
          )}
        </div>
      </div>
    );
  }

  /* ---------- 起始页 ---------- */
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-6 py-6">
      <AI伙伴 size={110} />
      <卡片 className="w-full animate-fade-in text-center">
        <卡片内容 className="space-y-4 p-8">
          <h2 className="text-2xl font-black text-foreground">
            三科小诊断 · 只要 3 分钟
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            数学、语文、英语各 3 道题。答完之后，我会根据你的表现更新学习画像，
            找出薄弱点并生成今天的专属学习路径。
          </p>
          <div className="flex justify-center gap-2 pt-2">
            {["math", "chinese", "english"].map((s) => {
              const meta = subjectMeta(s);
              return (
                <span key={s} className={`subject-chip border ${meta.chipClass}`}>
                  {meta.icon} {meta.label}
                </span>
              );
            })}
          </div>
          <按钮 size="lg" className="mt-2 min-w-48" disabled={starting} onClick={handleStart}>
            {starting ? "准备题目中…" : "🚀 开始诊断"}
          </按钮>
        </卡片内容>
      </卡片>
    </div>
  );
}
