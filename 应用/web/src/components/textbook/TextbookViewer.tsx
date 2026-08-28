/**
 * 教材翻阅器：显示教材原页图片，支持翻页。
 * 顶部"教材选择"下拉列出当前年级可用的教材，可切换。
 * 图片约定：{baseUrl}/pNNN.jpg（NNN 三位补零，1 起始）
 */
import { useEffect, useState } from "react";

export interface TextbookItem {
  id: string;
  label: string;
  baseUrl: string;
}

export function TextbookViewer({
  textbooks,
  kpIndex = 0,
  kpCount = 1,
}: {
  textbooks: TextbookItem[];
  kpIndex?: number;
  kpCount?: number;
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
    fetch(${book.baseUrl}/pages.json)
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* 教材选择下拉 */}
          <select
            value={book.id}
            onChange={(e) => setBookId(e.target.value)}
            aria-label="选择教材"
            className="h-9 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-foreground backdrop-blur transition hover:border-primary/40 focus:border-primary"
          >
            {textbooks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          <span className="text-sm font-medium text-muted-foreground">
            📖 {book.label} · 第 {safePage} 页 / 共 {total} 页
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            aria-label="上一页"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-muted-foreground backdrop-blur transition hover:border-primary/40 hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(total, p + 1))}
            disabled={safePage >= total}
            aria-label="下一页"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-muted-foreground backdrop-blur transition hover:border-primary/40 hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl">
        <img
          src={${book.baseUrl}/p.jpg}
          alt={教材第  页}
          className="mx-auto max-h-[500px] w-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
}