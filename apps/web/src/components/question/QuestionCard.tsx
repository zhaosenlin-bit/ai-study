import { KNOWLEDGE_POINTS } from "@/api/mockData";
import { cn } from "@/lib/utils";
import { subjectMeta } from "@/lib/学科";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Question } from "@contracts";

export function QuestionCard({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  const meta = subjectMeta(question.subject);
  const kp = KNOWLEDGE_POINTS[question.knowledge_point_ids[0]];

  return (
    <div className="glass-panel animate-pop w-full max-w-2xl p-6">
      {/* 题头 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`subject-chip border ${meta.chipClass}`}>
            {meta.icon} {meta.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {kp?.name ?? question.knowledge_point_ids[0]}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          难度 {"★".repeat(question.difficulty)}
          {"☆".repeat(Math.max(0, 5 - question.difficulty))}
        </span>
      </div>

      {/* 题干 */}
      <h2 className="mb-5 text-lg font-bold leading-relaxed text-foreground">
        {question.stem}
      </h2>

      {/* 作答区 */}
      {question.type === "single_choice" || question.type === "multiple_choice" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.options?.map((opt) => {
            const selected = value.split(",").includes(opt);
            return (
              <button
                key={opt}
                onClick={() => {
                  if (question.type === "multiple_choice") {
                    const list = selected
                      ? value.split(",").filter((o) => o !== opt)
                      : [...value.split(",").filter(Boolean), opt];
                    onChange(list.join(","));
                  } else {
                    onChange(opt);
                  }
                }}
                className={cn(
                  "question-option rounded-xl border border-white/12 bg-white/5 px-4 py-3.5 text-left text-base font-medium text-foreground transition-all hover:border-primary/40 hover:bg-white/10",
                  selected &&
                    "border-primary bg-primary/15 text-primary shadow-[0_0_14px_rgba(139,92,246,0.25)]",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : question.type === "fill_blank" ? (
        <Input
          placeholder="在这里填写答案…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-base"
        />
      ) : (
        <Textarea
          placeholder="用你自己的话回答，我会引导你一步步想清楚～"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
