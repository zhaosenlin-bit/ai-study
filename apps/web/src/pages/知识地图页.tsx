import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { KNOWLEDGE_POINTS } from "@/api/mockData";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { subjectMeta } from "@/lib/学科";
import { useAppStore } from "@/stores/应用状态";
import type { LearningTask } from "@contracts";

const STATUS_LABEL: Record<LearningTask["status"], string> = {
  todo: "待开始",
  doing: "进行中",
  done: "已完成",
};

export function 知识地图页() {
  const { studentId } = useAppStore();
  const { data: path, isLoading } = useQuery({
    queryKey: ["path", studentId],
    queryFn: () => api.getPath(studentId),
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", studentId],
    queryFn: () => api.getProfile(studentId),
  });

  const tasks = path?.tasks ?? [];
  const todo = tasks.filter((t) => t.status !== "done");
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col items-center gap-6 py-4">
      <AI伙伴 size={80} showBubble={false} />
      <div className="w-full">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-xl font-black text-foreground">学习路径地图 🗺️</h2>
          <span className="text-sm text-muted-foreground">
            完成 {doneCount}/{tasks.length}
          </span>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{path?.reason}</p>

        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">加载中…</CardContent>
          </Card>
        )}

        {/* 路径线 */}
        <div className="relative">
          <div className="absolute bottom-6 left-[27px] top-2 w-0.5 bg-gradient-to-b from-primary/60 via-white/15 to-white/5" />
          <div className="space-y-3">
            {tasks.map((task, i) => {
              const meta = subjectMeta(task.subject);
              const kp = KNOWLEDGE_POINTS[task.knowledge_point_id];
              const isWeak = profile?.weak_points.includes(task.knowledge_point_id);
              return (
                <div
                  key={task.task_id}
                  className="relative flex animate-fade-in items-center gap-4"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* 节点 */}
                  <div
                    className={cn(
                      "z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-xl",
                      task.status === "done"
                        ? "border-subject-english/50 bg-subject-english/15"
                        : task.status === "doing"
                          ? "border-primary bg-primary/20 shadow-[0_0_16px_rgba(139,92,246,0.4)]"
                          : "border-white/15 bg-white/5",
                    )}
                  >
                    {task.status === "done" ? "✅" : meta.icon}
                  </div>

                  {/* 任务卡 */}
                  <div
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-3",
                      task.status === "done"
                        ? "border-white/8 bg-white/3 opacity-70"
                        : task.status === "doing"
                          ? "border-primary/40 bg-primary/10"
                          : "border-white/12 bg-white/5",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{task.title}</span>
                        {isWeak && (
                          <span className="rounded-full bg-subject-chinese/15 px-2 py-0.5 text-[10px] font-bold text-subject-chinese">
                            薄弱
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          task.status === "done"
                            ? "text-subject-english"
                            : task.status === "doing"
                              ? "text-primary"
                              : "text-muted-foreground",
                        )}
                      >
                        {STATUS_LABEL[task.status]}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`subject-chip border ${meta.chipClass}`}>
                        {meta.icon} {meta.label}
                      </span>
                      <span>{kp?.name ?? task.knowledge_point_id}</span>
                      {kp && <span>难度 {"★".repeat(kp.difficulty)}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {todo.length === 0 && (
          <Card className="mt-4">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              所有任务都完成啦！明天 AI 伙伴会为你规划新的挑战 🎉
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
