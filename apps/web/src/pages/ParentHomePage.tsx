/** 家长端首页（借鉴可汗学院家长仪表盘）：KPI 统计卡 + 三科课程进度 + 学习建议 + 家长报告。 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { realGetCourses } from "@/api/courses";
import { AiCompanion } from "@/components/companion/AiCompanion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subjectMeta } from "@/lib/subjects";
import { useAppStore } from "@/stores/appStore";

const SUBJECT_ORDER = ["math", "chinese", "english"] as const;
const SUBJECT_BAR: Record<string, string> = {
  math: "from-subject-math to-cyan-300",
  chinese: "from-subject-chinese to-amber-300",
  english: "from-subject-english to-emerald-300",
};

export function ParentHomePage() {
  const { studentId, studentName, grade } = useAppStore();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["parent-profile", studentId],
    queryFn: () => api.getProfile(studentId),
  });
  const { data: report, isLoading: loadingReport } = useQuery({
    queryKey: ["parent-report", studentId],
    queryFn: () => api.getReport(studentId),
  });
  const { data: mistakes, isLoading: loadingMistakes } = useQuery({
    queryKey: ["parent-mistakes", studentId],
    queryFn: () => api.getMistakes(studentId),
  });
  // 三科课程进度（可汗式进度）
  const { data: coursesData } = useQuery({
    queryKey: ["parent-courses", studentId],
    queryFn: async () => {
      const [math, chinese, english] = await Promise.all(
        SUBJECT_ORDER.map((s) => realGetCourses(s, studentId, [3, 4, 5, 6].includes(grade) ? grade : 4)),
      );
      return { math, chinese, english };
    },
    enabled: Boolean(profile),
  });

  const mastery = (profile?.mastery ?? {}) as Record<string, number>;
  const hasData = Object.keys(mastery).length > 0;
  const isLoading = loadingProfile || loadingReport || loadingMistakes;

  const stats = useMemo(() => {
    const masteredKp = Object.values(mastery).filter((m) => m >= 0.8).length;
    const completedCourses = SUBJECT_ORDER.reduce(
      (s, sub) => s + (coursesData?.[sub].courses.filter((c) => c.completed).length ?? 0),
      0,
    );
    const totalCourses = SUBJECT_ORDER.reduce((s, sub) => s + (coursesData?.[sub].courses.length ?? 0), 0);
    const avgMastery = SUBJECT_ORDER.length
      ? Math.round((SUBJECT_ORDER.reduce((s, sub) => s + (mastery[sub] ?? 0), 0) / SUBJECT_ORDER.length) * 100)
      : 0;
    return { masteredKp, completedCourses, totalCourses, avgMastery, mistakeCount: mistakes?.length ?? 0 };
  }, [mastery, coursesData, mistakes]);

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-5 py-3">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-black text-foreground">家长端 · 学习看板</h2>
        <Badge className="border-subject-chinese/40 bg-subject-chinese/15 text-subject-chinese">家长模式</Badge>
        <span className="text-sm text-muted-foreground">
          {studentName} · {[3, 4, 5, 6].includes(grade) ? ["", "", "三年级", "四年级", "五年级", "六年级"][grade] : ""} · 学习进度概览
        </span>
      </div>

      <AiCompanion size={56} showBubble={false} />

      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">加载中…</CardContent>
        </Card>
      )}

      {!isLoading && !hasData && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="text-4xl">📭</div>
            <div className="font-semibold text-foreground">孩子还没有学习记录</div>
            <p className="max-w-sm text-sm text-muted-foreground">
              请让孩子使用自己的账号登录，完成「选年级 → 学习课程」，这里就会展示学习情况。
            </p>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <div className="space-y-5">
          {/* KPI 统计卡（可汗风格） */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard label="掌握知识点" value={stats.masteredKp} suffix="个" icon="🎯" />
            <KpiCard label="完成课程" value={stats.completedCourses} suffix={`/${stats.totalCourses}`} icon="📚" />
            <KpiCard label="错题" value={stats.mistakeCount} suffix="道" icon="📒" />
            <KpiCard label="掌握度均分" value={stats.avgMastery} suffix="%" icon="📈" />
          </div>

          {/* 三科进度 + 学习建议 */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>课程进度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {SUBJECT_ORDER.map((s) => {
                  const meta = subjectMeta(s);
                  const courses = coursesData?.[s].courses ?? [];
                  const done = courses.filter((c) => c.completed).length;
                  const pct = courses.length ? Math.round((done / courses.length) * 100) : 0;
                  const masteryPct = Math.round((mastery[s] ?? 0) * 100);
                  return (
                    <div key={s}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {meta.label} <span className="ml-2 text-xs text-muted-foreground">{done}/{courses.length} 门课程</span>
                        </span>
                        <span className="text-muted-foreground">掌握 {masteryPct}% · 进度 {pct}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${SUBJECT_BAR[s]} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 学习建议（可汗 Recommended） */}
            <Card>
              <CardHeader>
                <CardTitle>学习建议</CardTitle>
              </CardHeader>
              <CardContent>
                {report && report.suggestions.length > 0 ? (
                  <ul className="space-y-2.5">
                    {report.suggestions.map((sg, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-0.5 text-primary">◆</span>
                        <span className="leading-relaxed">{sg}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">完成诊断后生成建议。</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 家长报告 + 错因 */}
          {report && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>给家长的一封信</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>错因分布</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(report.mistake_stats).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(report.mistake_stats).map(([k, v]) => (
                        <Badge key={k} className="border-white/15 bg-white/8 text-muted-foreground">
                          {k} × {v}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">暂无错题数据。</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, suffix, icon }: { label: string; value: number; suffix: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span aria-hidden>{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-foreground">
        {value}
        <span className="ml-1 text-sm font-medium text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}
