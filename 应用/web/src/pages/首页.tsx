import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/api";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { 卡片, 卡片内容, 卡片头, 卡片标题 } from "@/components/ui/卡片";
import { 进度条 } from "@/components/ui/进度条";
import { subjectMeta } from "@/lib/学科";
import { useAppStore } from "@/stores/应用状态";

/** 从知识掌握度聚合出学科平均掌握度 */
function subjectMastery(mastery: Record<string, number>): { subject: string; value: number }[] {
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

/** 晴空背景组件 */
function SunnyBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      {/* 渐变背景：蓝天到暖阳 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7ec9f2] via-[#bfe6ff] to-[#ffe8c2]" />
      
      {/* 太阳 */}
      <div className="sky-sun absolute top-16 right-[10%] h-32 w-32 md:h-40 md:w-40" />
      
      {/* 白云 */}
      <div className="sky-cloud absolute left-[5%] top-[12%] h-6 w-20" style={{ animation: "cloud-drift 28s ease-in-out infinite" }} />
      <div className="sky-cloud absolute right-[20%] top-[22%] h-8 w-28 opacity-80" style={{ animation: "cloud-drift 35s ease-in-out 3s infinite" }} />
      <div className="sky-cloud absolute left-[30%] bottom-[25%] h-5 w-16 opacity-60" style={{ animation: "cloud-drift 22s ease-in-out 1s infinite" }} />
      
      {/* 底部暖光 */}
      <div className="sky-ground" />
    </div>
  );
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
    <>
      <SunnyBackground />
      
      <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-6 py-4 sm:gap-8">
        {/* AI 伙伴问候 - 移动端缩小 */}
        <div className="w-full max-w-lg sm:max-w-xl">
          <AI伙伴 />
        </div>

        {/* 今日任务 + 三科掌握度 - 移动端堆叠，桌面端并排 */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 今日任务 */}
          <卡片 className="animate-fade-up glass-panel">
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
                  todoTasks.slice(0, 5).map((t) => {
                    const meta = subjectMeta(t.subject);
                    return (
                      <Link
                        key={t.task_id}
                        to={/chat/}
                        className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/70 px-4 py-3 transition-all hover:border-[#e8830c]/40 hover:bg-white/90 backdrop-blur"
                      >
                        <span className={lex h-8 w-8 shrink-0 items-center justify-center rounded-lg border } aria-hidden>
                          {meta.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-foreground">{t.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {meta.label} · {t.status === "doing" ? "进行中" : "待开始"}
                          </div>
                        </div>
                        <span className="text-muted-foreground" aria-hidden>→</span>
                      </Link>
                    );
                  })
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">今天的任务都完成啦，真棒！🎉</p>
                ))}
            </卡片内容>
          </卡片>

          {/* 三科掌握度 */}
          <卡片 className="animate-fade-up delay-200 glass-panel">
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
                          <span className={h-2 w-2 rounded-full } />
                          {meta.label}
                        </span>
                        <span className={m.value < 60 ? "font-bold text-subject-chinese" : "text-muted-foreground"}>
                          {m.value}%
                        </span>
                      </div>
                      <进度条
                        value={m.value}
                        indicatorClassName={m.value < 60 ? "bg-subject-chinese" : "bg-[#e8830c]"}
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
        
        {/* 快捷入口 - 移动端自适应 */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 animate-fade-up delay-400">
          <Link
            to="/textbook"
            className="flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-4 py-2.5 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-white/80 hover:border-[#e8830c]/40 sm:px-5 sm:py-3"
          >
            📖 教材
          </Link>
          <Link
            to="/practice"
            className="flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-4 py-2.5 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-white/80 hover:border-[#e8830c]/40 sm:px-5 sm:py-3"
          >
            📸 拍照改卷
          </Link>
          <Link
            to="/mistakes"
            className="flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-4 py-2.5 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-white/80 hover:border-[#e8830c]/40 sm:px-5 sm:py-3"
          >
            📒 错题本
          </Link>
          <Link
            to="/path"
            className="flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-4 py-2.5 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-white/80 hover:border-[#e8830c]/40 sm:px-5 sm:py-3"
          >
            🗺️ 知识地图
          </Link>
        </div>
      </div>
    </>
  );
}