import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import { TOOL_TRACES } from "@/api/mockData";
import { QuestionCard } from "@/components/question/QuestionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { subjectMeta } from "@/lib/subjects";
import { useAppStore } from "@/stores/appStore";
import {
  collectAnswers,
  useLearningStore,
} from "@/stores/learningStore";

export function DiagnosisPage() {
  const navigate = useNavigate();
  const { studentId, setCompanion } = useAppStore();
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
  const [error, setError] = useState<string | null>(null);

  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  async function handleStart() {
    setStarting(true);
    setError(null);
    setCompanion("开始三科小诊断啦，我会根据你的回答找出薄弱点～", "thinking");
    try {
      const session = await api.startDiagnosis(studentId, 4, ["math", "chinese", "english"], 3);
      startSession(session.session_id, session.questions);
      setToolTrace(TOOL_TRACES["diagnosis"]);
      setCompanion("第一题来啦，慢慢来，不着急！", "greeting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "诊断启动失败，请稍后重试");
      setCompanion("诊断启动出了点问题，我们再试一次？", "idle");
    } finally {
      setStarting(false);
    }
  }

  async function handleSubmit() {
    if (!sessionId) return;
    setSubmitting(true);
    setError(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后重试");
      setCompanion("提交出了点问题，我们再试一次？", "idle");
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
        <Card className="w-full animate-fade-in">
          <CardContent className="space-y-5 p-6">
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
                    <Badge key={w} className={`border ${meta.chipClass}`}>
                      {meta.icon} {w}
                    </Badge>
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
              <Button size="lg" onClick={() => navigate("/path")}>
                🗺️ 查看学习路径
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/chat/math")}
              >
                🧑‍🏫 先去辅导薄弱点
              </Button>
              <Button size="lg" variant="ghost" onClick={handleRestart}>
                重新诊断
              </Button>
            </div>
          </CardContent>
        </Card>
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
          <Progress value={progress} className="flex-1" />
          <span className="text-xs text-muted-foreground">已答 {answeredCount} 题</span>
        </div>

        <QuestionCard
          question={q}
          value={answers[q.id] ?? ""}
          onChange={(v) => setAnswer(q.id, v)}
        />

        {error && (
          <p className="w-full max-w-2xl text-center text-sm font-medium text-destructive">
            {error}，请重试。
          </p>
        )}

        <div className="flex w-full max-w-2xl items-center justify-between gap-3">
          <Button variant="ghost" size="lg" disabled={currentIndex === 0} onClick={goPrev}>
            ← 上一题
          </Button>
          {isLast ? (
            <Button
              size="lg"
              disabled={submitting || answeredCount < questions.length}
              onClick={handleSubmit}
            >
              {submitting ? "分析中…" : "✅ 提交诊断"}
            </Button>
          ) : (
            <Button size="lg" onClick={goNext}>
              下一题 →
            </Button>
          )}
        </div>
      </div>
    );
  }

  /* ---------- 题目加载失败（防御：questions 为空但 session 已建） ---------- */
  if (sessionId && questions.length === 0) {
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-4 py-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="space-y-3 p-6">
            <p className="text-sm text-destructive">题目加载失败，请重试。</p>
            <Button size="lg" onClick={handleRestart}>重新诊断</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- 起始页 ---------- */
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-6 py-6">
      <Card className="w-full animate-fade-in text-center">
        <CardContent className="space-y-4 p-8">
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
          {error && (
            <p className="mx-auto max-w-md text-sm font-medium text-destructive">
              {error}，请检查网络后重试。
            </p>
          )}
          <Button size="lg" className="mt-2 min-w-48" disabled={starting} onClick={handleStart}>
            {starting ? "准备题目中…" : "🚀 开始诊断"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
