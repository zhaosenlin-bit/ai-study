import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/api";
import { AiCompanion } from "@/components/companion/AiCompanion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { subjectMeta } from "@/lib/subjects";
import { useAppStore } from "@/stores/appStore";

/** 从知识掌握度聚合出学科平均掌握度 */
function subjectMastery(
  mastery: Record<string, number>,
): { subject: string; value: number }[] {
  const sum: Record<string, { total: number; count: number }> = {};
  for (const [kp, v] of Object.entries(mastery)) {
    const subject = kp.split("_")[0];
    if (!sum[subject]) sum[subject] = { total: 0, count: 0 };
    sum[subject].total += v;
    sum[subject].count += 1;
  }
  return ["math", "chinese", "english"]
    .filter((s) => sum[s])
    .map((s) => ({ subject: s, value: Math.round((sum[s].total / sum[s].count) * 100) }));
}

export function HomePage() {
  const { studentId, studentName } = useAppStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", studentId],
    queryFn: () => api.getProfile(studentId),
  });
  const { data: path } = useQuery({
    queryKey: ["path", studentId],
    queryFn: () => api.getPath(studentId),
  });

  const mastery = subjectMastery(profile?.mastery ?? {});
  const todoTasks = path?.tasks.filter((t) => t.status !== "done") ?? [];
  const doneCount = path?.tasks.filter((t) => t.status === "done").length ?? 0;

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center gap-8 py-4">
      {/* AI 伙伴问候 */}
      <div className="w-full max-w-xl">
        <AiCompanion />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {/* 今日任务 */}
        <Card className="animate-fade-in">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>今日任务</CardTitle>
            <span className="text-xs text-muted-foreground">
              已完成 {doneCount}/{path?.tasks.length ?? 0}
            </span>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {isLoading && <p className="py-6 text-center text-sm text-muted-foreground">加载中…</p>}
            {!isLoading &&
              (todoTasks.length ? (
                todoTasks.map((t) => {
                  const meta = subjectMeta(t.subject);
                  return (
                    <Link
                      key={t.task_id}
                      to={`/chat/${t.subject}`}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all hover:border-primary/40 hover:bg-white/8"
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${meta.chipClass}`}
                        aria-hidden
                      >
                        {meta.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {t.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {meta.label} · {t.status === "doing" ? "进行中" : "待开始"}
                        </div>
                      </div>
                      <span className="text-muted-foreground" aria-hidden>
                        →
                      </span>
                    </Link>
                  );
                })
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  今天的任务都完成啦，真棒！🎉
                </p>
              ))}
          </CardContent>
        </Card>

        {/* 三科掌握度 */}
        <Card className="animate-fade-in [animation-delay:80ms]">
          <CardHeader>
            <CardTitle>三科掌握度</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && <p className="py-6 text-center text-sm text-muted-foreground">加载中…</p>}
            {!isLoading &&
              mastery.map((m) => {
                const meta = subjectMeta(m.subject);
                return (
                  <div key={m.subject}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
                        {meta.label}
                      </span>
                      <span className={m.value < 60 ? "font-bold text-subject-chinese" : "text-muted-foreground"}>
                        {m.value}%
                      </span>
                    </div>
                    <Progress
                      value={m.value}
                      indicatorClassName={m.value < 60 ? "bg-subject-chinese" : "bg-primary"}
                    />
                  </div>
                );
              })}
            {!isLoading && (
              <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
                我是{studentName}的 AI 学习伙伴，掌握度低于 60% 的知识点我会优先安排进你的学习路径哦。
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
