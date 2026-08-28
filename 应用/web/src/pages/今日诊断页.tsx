import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { DailyQuestion } from "@contracts";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { 卡片, 卡片内容 } from "@/components/ui/卡片";
import { 按钮 } from "@/components/ui/按钮";
import { useAppStore } from "@/stores/应用状态";
import { cn } from "@/lib/工具函数";

type View = "cards" | "answer" | "result";

/** 六类题分组展示卡 */
function 分类卡({ icon, label, count, done, onClick }: { icon: string; label: string; count: number; done?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-white/20"
    >
      <span className="text-2xl" aria-hidden>{icon}</span>
      <span className="text-center text-xs font-semibold text-foreground">{label}</span>
      <span className={cn("text-[10px]", done ? "text-emerald-400" : "text-muted-foreground")}>
        {done ? "已完成 ✓" : `${count} 题`}
      </span>
    </button>
  );
}

export function 今日诊断页() {
  const { studentId, grade } = useAppStore();
  const qc = useQueryClient();
  const [view, setView] = useState<View>("cards");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Awaited<ReturnType<typeof api.submitDailyDiagnosis>> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["today-diagnosis", studentId, grade],
    queryFn: () => api.todayDiagnosis(studentId, grade),
    enabled: [3, 4, 5, 6].includes(grade),
  });

  // 按分类分组
  const groups = useMemo(() => {
    const map = new Map<string, DailyQuestion[]>();
    for (const q of data?.questions ?? []) {
      if (!map.has(q.category)) map.set(q.category, []);
      map.get(q.category)!.push(q);
    }
    return [...map.entries()].map(([cat, qs]) => ({ category: cat, label: qs[0].category_label, icon: qs[0].category_icon, questions: qs }));
  }, [data]);

  const submit = useMutation({
    mutationFn: () =>
      api.submitDailyDiagnosis(
        studentId,
        grade,
        (data?.questions ?? []).map((q) => ({ category: q.category, question_id: q.id, answer: answers[q.id] ?? "" })),
      ),
    onSuccess: (res) => {
      setResult(res);
      setView("result");
      qc.invalidateQueries({ queryKey: ["today-diagnosis"] });
    },
  });

  const doneToday = data?.done_today;
  const savedResult = data?.result;

  if (isLoading) {
    return (
      <div className="mx-auto flex h-full max-w-3xl items-center justify-center">
        <卡片><卡片内容 className="p-8 text-sm text-muted-foreground">加载今日诊断…</卡片内容></卡片>
      </div>
    );
  }

  if (![3, 4, 5, 6].includes(grade)) {
    return (
      <div className="mx-auto flex h-full max-w-3xl items-center justify-center">
        <卡片><卡片内容 className="p-8 text-center text-sm text-muted-foreground">请先在上方选择年级，即可开始每日诊断</卡片内容></卡片>
      </div>
    );
  }

  // ============ 结果视图 ============
  if (view === "result" && result) {
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-5 py-2">
        <div className="flex items-center gap-3">
          <AI伙伴 size={56} showBubble={false} />
          <div>
            <h2 className="text-xl font-black text-foreground">今日诊断完成 🎉</h2>
            <p className="text-sm text-muted-foreground">
              {result.weakness.length > 0 ? `发现 ${result.weakness.length} 个待加强维度，明天记得复习错题` : "全维度达标，继续保持！"}
            </p>
          </div>
        </div>

        {/* 六维成绩 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {result.category_scores.map((s) => {
            const weak = s.score < 0.6;
            return (
              <卡片 key={s.category} className={cn(weak && "ring-2 ring-rose-400/40")}>
                <卡片内容 className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <span aria-hidden>{s.icon}</span>{s.label}
                    </span>
                    <span className={cn("text-sm font-black", weak ? "text-rose-400" : "text-emerald-400")}>
                      {Math.round(s.score * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn("h-full rounded-full transition-all", weak ? "bg-rose-400" : "bg-emerald-400")}
                      style={{ width: `${s.score * 100}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] text-muted-foreground">{s.correct}/{s.total} 题正确</div>
                </卡片内容>
              </卡片>
            );
          })}
        </div>

        {result.weakness.length > 0 && (
          <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm ring-1 ring-rose-400/30">
            <span className="font-bold text-rose-300">💪 今日弱项：</span>
            {result.weakness.map((w) => `${w.icon}${w.label}`).join("、")} —— 已加入错题本，明天来复习！
          </div>
        )}
        {result.weakness.length === 0 && (
          <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm ring-1 ring-emerald-400/30">
            <span className="font-bold text-emerald-300">🌟 全部达标！</span> 明天继续来诊断，AI 会按你的进度出题。
          </div>
        )}
      </div>
    );
  }

  // ============ 答题视图 ============
  if (view === "answer" && data) {
    const qs = data.questions;
    const answeredCount = qs.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "").length;
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">今日诊断</h2>
          <span className="text-xs font-semibold text-muted-foreground">已答 {answeredCount}/{qs.length}</span>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto pb-2">
          {qs.map((q, i) => (
            <卡片 key={q.id}>
              <卡片内容 className="p-5">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold">
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-muted-foreground">
                    {q.category_icon} {q.category_label}
                  </span>
                  <span className="text-muted-foreground">第 {i + 1} 题</span>
                </div>
                <p className="mb-3 text-sm font-medium leading-relaxed text-foreground">{q.stem}</p>
                {q.type === "choice" ? (
                  <div className="grid grid-cols-1 gap-2">
                    {(q.options ?? []).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                        className={cn(
                          "rounded-xl border px-4 py-2.5 text-left text-sm transition",
                          answers[q.id] === opt
                            ? "border-primary/60 bg-primary/15 text-foreground"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    placeholder="输入答案"
                    className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                )}
              </卡片内容>
            </卡片>
          ))}
        </div>
        <按钮
          onClick={() => submit.mutate()}
          disabled={answeredCount < qs.length || submit.isPending}
          className="h-12 w-full text-base"
        >
          {submit.isPending ? "AI 批改中…" : `提交诊断（${answeredCount}/${qs.length}）`}
        </按钮>
      </div>
    );
  }

  // ============ 已诊断（显示上次结果入口）/ 六类卡 ============
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-5 py-2">
      <div className="flex items-center gap-3">
        <AI伙伴 size={56} showBubble={false} />
        <div>
          <h2 className="text-xl font-black text-foreground">
            {doneToday ? "今日诊断已完成 ✨" : "今日诊断 · 每天一测"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {doneToday ? "明天再来，AI 会按你的进度出新的题" : "6 大维度全面体检，3 分钟找出薄弱点"}
          </p>
        </div>
      </div>

      {doneToday && savedResult ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {savedResult.category_scores.map((s) => (
              <div
                key={s.category}
                className={cn(
                  "rounded-2xl bg-white/5 p-4 text-center ring-1 ring-white/10",
                  s.score < 0.6 && "ring-rose-400/40",
                )}
              >
                <div className="text-xl" aria-hidden>{s.icon}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{s.label}</div>
                <div className={cn("text-lg font-black", s.score < 0.6 ? "text-rose-400" : "text-emerald-400")}>
                  {Math.round(s.score * 100)}%
                </div>
              </div>
            ))}
          </div>
          {savedResult.weakness.length > 0 && (
            <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm ring-1 ring-rose-400/30">
              <span className="font-bold text-rose-300">💪 待加强：</span>
              {savedResult.weakness.map((w) => `${w.icon}${w.label}`).join("、")}（错题已入本，记得每天复习）
            </div>
          )}
          <按钮 variant="outline" onClick={() => navCourse()}>去课程继续练习 →</按钮>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {groups.map((g) => (
              <分类卡 key={g.category} icon={g.icon} label={g.label} count={g.questions.length} />
            ))}
          </div>
          <按钮 onClick={() => setView("answer")} className="h-12 w-full text-base">
            🚀 开始今日诊断（{data?.questions.length ?? 0} 题）
          </按钮>
        </>
      )}
    </div>
  );

  function navCourse() {
    window.location.href = "/learn";
  }
}
