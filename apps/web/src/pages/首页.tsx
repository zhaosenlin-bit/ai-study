import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/api";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { 卡片, 卡片内容, 卡片头, 卡片标题 } from "@/components/ui/卡片";
import { 进度条 } from "@/components/ui/进度条";
import { subjectMeta } from "@/lib/学科";
import { useAppStore } from "@/stores/应用状态";

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

export function 首页() {
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
        <AI伙伴 />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {/* 今日任务 */}
        <卡片 className="animate-fade-in">
          <卡片头 className="flex-row items-center justify-between">
            <卡片标题>今日任务</卡片标题>
            <span className="text-xs text-muted-foreground">
              已完成 {doneCount}/{path?.tasks.length ?? 0}
            </span>
          </卡片头>
          <卡片内容 className="space-y-2.5">
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
          </卡片内容>
        </卡片>

        {/* 三科掌握度 */}
        <卡片 className="animate-fade-in [animation-delay:80ms]">
          <卡片头>
            <卡片标题>三科掌握度</卡片标题>
          </卡片头>
          <卡片内容 className="space-y-4">
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
                    <进度条
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
          </卡片内容>
        </卡片>
      </div>
    </div>
  );
}
