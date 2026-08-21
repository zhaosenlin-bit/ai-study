/** 家长端首页：孩子学习看板（档案 / 三科掌握度 / 错题统计 / 报告建议）。 */
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { AiCompanion } from "@/components/companion/AiCompanion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subjectMeta } from "@/lib/subjects";
import { useAppStore } from "@/stores/appStore";

const SUBJECT_ORDER = ["math", "chinese", "english"] as const;

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

  const hasData = profile && Object.keys(profile.mastery ?? {}).length > 0;
  const isLoading = loadingProfile || loadingReport || loadingMistakes;

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col items-center gap-6 py-4">
      <AiCompanion size={80} showBubble={false} />
      <div className="w-full">
        <div className="mb-1 flex items-center gap-3">
          <h2 className="text-xl font-black text-foreground">家长端 · 学习看板</h2>
          <Badge className="border-subject-chinese/40 bg-subject-chinese/15 text-subject-chinese">
            家长模式
          </Badge>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          查看 {studentName} 的学习档案、掌握情况与复习建议。
        </p>
      </div>

      {isLoading && (
        <Card className="w-full">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">加载中…</CardContent>
        </Card>
      )}

      {!isLoading && !hasData && (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="text-4xl">📭</div>
            <div className="font-semibold text-foreground">孩子还没有学习记录</div>
            <p className="max-w-sm text-sm text-muted-foreground">
              请让孩子使用自己的账号登录，完成「选年级 → 三科诊断」，这里就会展示学习情况。
            </p>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {/* 孩子档案 */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>孩子档案</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="姓名" value={studentName} />
              <Row
                label="年级"
                value={[3, 4, 5, 6].includes(grade) ? ["", "", "三年级", "四年级", "五年级", "六年级"][grade] : "未选"}
              />
              <Row label="掌握知识点" value={`${Object.keys(profile.mastery ?? {}).length} 个`} />
              <Row label="薄弱知识点" value={`${(profile?.weak_points ?? []).length} 个`} />
              <Row label="错题数" value={`${mistakes?.length ?? 0} 道`} />
              <Row label="最近更新" value={(profile?.updated_at ?? "-").slice(0, 16)} />
            </CardContent>
          </Card>

          {/* 三科掌握度 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>三科掌握度</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {SUBJECT_ORDER.map((s) => {
                const meta = subjectMeta(s);
                const pct = Math.round((profile.mastery[s] ?? 0) * 100);
                return (
                  <div key={s}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{meta.label}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-subject-math transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 家长报告 */}
          {report && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>给家长的一封信</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
                {report.suggestions.length > 0 && (
                  <div>
                    <div className="mb-2 text-sm font-semibold text-foreground">学习建议</div>
                    <ul className="space-y-1.5">
                      {report.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-0.5 text-primary">◆</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {Object.keys(report.mistake_stats).length > 0 && (
                  <div>
                    <div className="mb-2 text-sm font-semibold text-foreground">错因分布</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(report.mistake_stats).map(([k, v]) => (
                        <Badge key={k} className="border-white/15 bg-white/8 text-muted-foreground">
                          {k} × {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
