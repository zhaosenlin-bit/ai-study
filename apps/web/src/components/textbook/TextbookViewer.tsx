import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TextbookItem } from "@/lib/textbooks";

/**
 * 教材翻阅器：显示教材原页图片，支持翻页。
 * 顶部"教材选择"下拉列出当前年级可用的教材（克隆渲染好的），可切换。
 * 图片约定：{baseUrl}/pNNN.jpg（NNN 三位补零，1 起始）；{baseUrl}/pages.json 提供 total_pages。
 * 起始页 = 知识点在年级列表中的顺序等分定位（封面/目录约占前 6 页），可在翻阅中校正。
 */
export function TextbookViewer({
  textbooks,
  kpIndex,
  kpCount,
}: {
  /** 当前年级可选的教材清单 */
  textbooks: TextbookItem[];
  /** 知识点在年级知识点数组中的序号（0 起始） */
  kpIndex: number;
  /** 年级知识点总数 */
  kpCount: number;
}) {
  const [bookId, setBookId] = useState<string>(textbooks[0]?.id ?? "");
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const book = textbooks.find((b) => b.id === bookId) ?? textbooks[0];

  // 切换教材：加载总页数并计算起始页（等分定位，可翻页校正）
  useEffect(() => {
    let alive = true;
    setTotal(null);
    if (!book) return;
    fetch(`${book.baseUrl}/pages.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d?.total_pages) return;
        const bodyStart = 6; // 封面+版权+目录约 6 页
        const body = Math.max(1, d.total_pages - bodyStart);
        const start = bodyStart + Math.round((kpIndex / Math.max(1, kpCount)) * body);
        setTotal(d.total_pages);
        setPage(Math.min(Math.max(1, start), d.total_pages));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [book, kpIndex, kpCount]);

  // 无可选教材 → 不显示
  if (!textbooks.length || !book || total === null) return null;

  const safePage = Math.min(Math.max(1, page), total);

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* 教材选择下拉（新选项：克隆的对应年级教材） */}
          <select
              value={book.id}
              onChange={(e) => setBookId(e.target.value)}
              aria-label="选择教材"
              className="h-8 rounded-lg border border-border bg-white/80 px-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary/40"
            >
              {textbooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            📖 {book.label} · 第 {safePage} 页 / 共 {total} 页
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            aria-label="上一页"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/80 text-muted-foreground transition hover:border-primary/30 hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={15} strokeWidth={2.6} />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(total, p + 1))}
            disabled={safePage >= total}
            aria-label="下一页"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/80 text-muted-foreground transition hover:border-primary/30 hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={15} strokeWidth={2.6} />
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_10px_28px_rgba(217,119,6,0.12)]">
        <img
          src={`${book.baseUrl}/p${String(safePage).padStart(3, "0")}.jpg`}
          alt={`教材第 ${safePage} 页`}
          className="mx-auto max-h-[440px] w-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
}
