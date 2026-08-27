import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/api";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { subjectMeta } from "@/lib/学科";
import { useAppStore } from "@/stores/应用状态";

function formatReview(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "今天到期";
  if (diff === 1) return "明天到期";
  if (diff > 1) return `${diff} 天后到期`;
  return "已到期";
}

const ERROR_COLOR: Record<string, string> = {
  概念混淆: "bg-subject-chinese/15 text-subject-chinese border-subject-chinese/30",
  规则不熟: "bg-subject-math/15 text-subject-math border-subject-math/30",
  粗心: "bg-white/8 text-muted-foreground border-white/15",
  计算失误: "bg-subject-math/15 text-subject-math border-subject-math/30",
  表达不清: "bg-subject-chinese/15 text-subject-chinese border-subject-chinese/30",
};

export function 错题本页() {
  const { studentId } = useAppStore();
  const { data: mistakes, isLoading } = useQuery({
    queryKey: ["mistakes", studentId],
    queryFn: () => api.getMistakes(studentId),
  });

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col items-center gap-6 py-4">
      <AI伙伴 size={80} showBubble={false} />
      <div className="w-full">
        <h2 className="mb-1 text-xl font-black text-foreground">我的错题本 📒</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          错题会按记忆规律安排复习，到期系统会提醒你。
        </p>

        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">加载中…</CardContent>
          </Card>
        )}

        {!isLoading && mistakes?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              还没有错题，继续保持！🎉
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {mistakes?.map((m) => {
            const meta = subjectMeta(m.subject);
            const color = ERROR_COLOR[m.error_type] ?? "bg-white/8 text-muted-foreground border-white/15";
            return (
              <Card key={m.mistake_id} className="animate-fade-in">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className={`subject-chip border ${meta.chipClass}`}>
                      {meta.icon} {meta.label}
                    </span>
                    <Badge className={`border ${color}`}>{m.error_type}</Badge>
                  </div>
                  <div className="mb-1 text-sm font-bold text-foreground">
                    第 {m.review_count} 次复习
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {m.explanation ?? "回顾一下当时的思路吧"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-subject-english">
                      🔔 {formatReview(m.next_review_at)}
                    </span>
                    <Link to={`/chat/${m.subject}`}>
                      <Button size="sm" variant="outline">
                        重新作答
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
