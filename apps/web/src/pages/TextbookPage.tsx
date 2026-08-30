import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TEXTBOOK_KNOWLEDGE } from "@/api/textbookData";

/** 教材 PDF 直链预览（浏览器内置 PDF viewer 内嵌；不行就用底部下载按钮）。 */
import { StarBuddy } from "@/components/companion/StarBuddy";

interface KnowledgePoint {
  id: string;
  name: string;
  grade: number;
  difficulty: number;
  subject?: string;
  textbook?: {
    version: string;
    grade: number;
    volume: number;
    unit: number;
    unit_name: string;
    pdf_url?: string;
  };
  pdf_url?: string;
}

/** 教材目录页：版本 → 年级 → 册 → 单元 → 知识点 */
const SUBJECTS = [
  { key: "math", label: "数学", versions: ["人教版", "北师大版", "苏教版"] },
  { key: "chinese", label: "语文", versions: ["统编版"] },
  { key: "english", label: "英语", versions: ["人教版 PEP（三年级起点）"] },
];

export function TextbookPage() {
  const [subject, setSubject] = useState("math");
  const [version, setVersion] = useState("人教版");
  const [grade, setGrade] = useState(3);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const currentSubject = SUBJECTS.find((s) => s.key === subject)!;

  const { data, isLoading } = useQuery({
    queryKey: ["textbook-knowledge", subject, version],
    queryFn: async () => {
      // 静态数据按 version 过滤；其他版本若未收录则返回空数组
      const filtered = (TEXTBOOK_KNOWLEDGE as KnowledgePoint[]).filter(
        (k) =>
          (!k.subject || k.subject === subject) &&
          (!k.textbook || k.textbook.version === version),
      );
      return { version, knowledge_points: filtered };
    },
    staleTime: 5 * 60_000,
  });

  const kps = data?.knowledge_points ?? [];
  const gradeKps = kps.filter(
    (k) => k.grade === grade && (!k.textbook || k.textbook.version === version),
  );

  // 按 册(volume) 分组，标题统一"上册｜课本"/"下册｜课本"（与语文/英语一致）。
  const groups = new Map<string, { items: KnowledgePoint[]; pdfUrl?: string }>();
  for (const k of gradeKps) {
    const tb = k.textbook;
    const key = tb
      ? `${tb.volume === 1 ? "上册" : "下册"}｜课本`
      : "未标注教材";
    const entry = groups.get(key) ?? { items: [] };
    entry.items.push(k);
    // 兼容两种来源：后端返回 textbook.pdf_url；静态数据顶层 pdf_url
    if (tb?.pdf_url) entry.pdfUrl = tb.pdf_url;
    else if (k.pdf_url) entry.pdfUrl = k.pdf_url;
    groups.set(key, entry);
  }

  return (
    <div className="space-y-4">
      {/* 顶部 Banner */}
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[hsl(var(--primary))] via-[#ff7f3f] to-[#ffb347] text-[hsl(var(--primary-foreground))]">
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <div>
            <div className="text-xs opacity-90">{version} · 小学数学</div>
            <div className="text-base font-bold">📖 教材目录 · 点击预览课本内容</div>
          </div>
          <div className="text-3xl">☀️</div>
        </CardContent>
      </Card>

      {/* AI 学习伙伴 · 小星（顶部问候区） */}
      <StarBuddy />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📚 教材目录 <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">{currentSubject.label} · {version} · 1-6 年级</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 学科切换 */}
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setSubject(s.key);
                  setVersion(s.versions[0]);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  subject === s.key
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {/* 版本切换 */}
          <div className="flex flex-wrap gap-2">
            {currentSubject.versions.map((v) => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  version === v
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {/* 年级切换 */}
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  grade === g
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
                }`}
              >
                {g} 年级
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            加载教材目录…
          </CardContent>
        </Card>
      ) : gradeKps.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            {currentSubject.label} {grade} 年级（{version}）暂无教材内容，请先选择人教版。
          </CardContent>
        </Card>
      ) : (
        [...groups.entries()].map(([groupName, group]) => (
          <Card key={groupName}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">{groupName}</CardTitle>
              {group.pdfUrl ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewUrl(group.pdfUrl ?? "")}
                    className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-semibold hover:border-[hsl(var(--ring))]"
                  >
                    👁️ 预览
                  </button>
                  <a
                    href={group.pdfUrl ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
                  >
                    📖 打开教材 PDF
                  </a>
                </div>
              ) : (
                <span
                  className="rounded-lg border border-dashed border-[hsl(var(--border))] px-3 py-1.5 text-xs text-[hsl(var(--muted-foreground))]"
                  title="该册 PDF 暂未收录（之前下载的文件损坏）"
                >
                  📄 PDF 暂未提供
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3"
                  >
                    <span className="text-sm font-medium">{k.name}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {"★".repeat(Math.min(k.difficulty, 5)) || "★"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* PDF 内嵌预览 */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[hsl(var(--card))] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-2">
              <span className="text-sm font-semibold">📖 教材预览</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-[hsl(var(--primary))] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary-foreground))]"
                >
                  新窗口打开
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="rounded-lg bg-[hsl(var(--muted))] px-3 py-1 text-sm font-semibold hover:bg-[hsl(var(--secondary))]"
                >
                  关闭
                </button>
              </div>
            </div>
            <iframe
              src={previewUrl}
              title="教材 PDF 预览"
              className="h-full w-full flex-1 border-0 bg-white"
            />
            <div className="flex flex-col gap-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">
              <span>预览打不开？国内访问受网络影响。点下方按钮直接下载到本地查看（推荐）：</span>
              <div className="flex flex-wrap gap-2">
                <a
                  href={previewUrl.replace("https://docs.google.com/viewer?embedded=true&url=", "")}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="rounded-lg bg-[hsl(var(--primary))] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary-foreground))]"
                >
                  📥 下载 PDF
                </a>
                <a
                  href={previewUrl.replace("https://docs.google.com/viewer?embedded=true&url=", "")}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-[hsl(var(--border))] px-3 py-1 text-xs font-semibold"
                >
                  新窗口打开
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
