import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { RadarChart } from "@/components/chart/RadarChart";
import { AiCompanion } from "@/components/companion/AiCompanion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subjectMeta } from "@/lib/subjects";
import { useAppStore } from "@/stores/appStore";

const SUBJECT_ORDER = ["math", "chinese", "english"] as const;

const STAT_COLOR: Record<string, string> = {
  概念混淆: "bg-subject-chinese/15 text-subject-chinese border-subject-chinese/30",
  规则不熟: "bg-subject-math/15 text-subject-math border-subject-math/30",
  粗心: "bg-white/8 text-muted-foreground border-white/15",
  计算失误: "bg-subject-math/15 text-subject-math border-subject-math/30",
  表达不清: "bg-subject-chinese/15 text-subject-chinese border-subject-chinese/30",
};

export function ReportPage() {
  const { studentId, studentName } = useAppStore();
  const { data: report, isLoading } = useQuery({
    queryKey: ["report", studentId],
    queryFn: () => api.getReport(studentId),
  });

  const indicators = SUBJECT_ORDER.map((s) => ({
    name: subjectMeta(s).label,
    max: 100,
  }));
  const values = SUBJECT_ORDER.map((s) =>
    report ? Math.round((report.mastery[s] ?? 0) * 100) : 0,
  );

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col items-center gap-6 py-4">
      <AiCompanion size={80} showBubble={false} />
      <div className="w-full">
        <h2 className="mb-1 text-xl font-black text-foreground">
          {studentName}的学习报告 📊
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          给家长的一封信：孩子的薄弱点与复习建议。
        </p>

        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">加载中…</CardContent>
          </Card>
        )}

        {report && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* 总览 */}
            <Card className="animate-fade-in md:col-span-2">
              <CardHeader>
                <CardTitle>本周总结</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <RadarChart indicators={indicators} values={values} name={studentName} className="h-56 w-full" />
                  </div>
                  <div className="space-y-3 text-sm">
                    {SUBJECT_ORDER.map((s) => {
                      const meta = subjectMeta(s);
                      const v = Math.round((report.mastery[s] ?? 0) * 100);
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
                          <span className="w-8 text-muted-foreground">{meta.label}</span>
                          <span className={v < 60 ? "font-bold text-subject-chinese" : "font-bold text-foreground"}>
                            {v}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 错因统计 */}
            <Card className="animate-fade-in [animation-delay:80ms]">
              <CardHeader>
                <CardTitle>错因统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {Object.entries(report.mistake_stats).map(([type, count]) => {
                  const color = STAT_COLOR[type] ?? "bg-white/8 text-muted-foreground border-white/15";
                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5"
                    >
                      <Badge className={`border ${color}`}>{type}</Badge>
                      <span className="text-lg font-black text-foreground">{count}</span>
                    </div>
                  );
                })}
                <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-muted-foreground">
                  合计 {Object.values(report.mistake_stats).reduce((a, b) => a + b, 0)} 条错题记录
                </div>
              </CardContent>
            </Card>

            {/* 建议 */}
            <Card className="animate-fade-in md:col-span-3 [animation-delay:160ms]">
              <CardHeader>
                <CardTitle>下周建议</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {report.suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-foreground/90"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
