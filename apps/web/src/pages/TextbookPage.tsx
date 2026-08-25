import { useState } from "react";
import { TextbookViewer } from "@/components/textbook/TextbookViewer";
import { textbooksFor } from "@/lib/textbooks";
import { useAppStore } from "@/stores/appStore";
import { SUBJECT_META } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import type { Subject } from "@contracts";

const SUBJECTS: Subject[] = ["math", "chinese", "english"];

export function TextbookPage() {
  const { grade } = useAppStore();
  const [subject, setSubject] = useState<Subject>("math");
  const textbooks = textbooksFor(subject, grade);

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center gap-5 py-4 md:gap-6 md:py-6">
      {/* 顶部标题 + 学科切换 */}
      <div className="w-full text-center">
        <h1 className="font-serif-display text-2xl font-bold text-foreground md:text-[28px]">
          📚 教材
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {grade} 年级 · 选择学科查看对应年级的教材
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUBJECTS.map((s) => {
          const meta = SUBJECT_META[s];
          const active = subject === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition active:scale-95",
                active
                  ? meta.chipClass + " shadow-sm"
                  : "border-border bg-white/70 text-muted-foreground hover:border-primary/30",
              )}
              aria-pressed={active}
            >
              <span aria-hidden className="text-base leading-none">{meta.icon}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* 教材翻阅器 / 降级提示 */}
      <div className="w-full">
        {textbooks.length === 0 ? (
          <div className="glass-panel p-8 text-center text-sm text-muted-foreground">
            {grade} 年级{SUBJECT_META[subject].label}教材暂未加入，试试其他学科。
          </div>
        ) : (
          <TextbookViewer textbooks={textbooks} kpIndex={0} kpCount={1} />
        )}
      </div>
    </div>
  );
}
