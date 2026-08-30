import type { Subject } from "@contracts";

export const SUBJECT_META: Record<
  Subject,
  { label: string; icon: string; chipClass: string; dotClass: string }
> = {
  math: {
    label: "数学",
    icon: "🔢",
    chipClass: "border-subject-math/60 bg-subject-math/20 text-subject-math",
    dotClass: "bg-subject-math",
  },
  chinese: {
    label: "语文",
    icon: "📖",
    chipClass: "border-subject-chinese/60 bg-subject-chinese/20 text-subject-chinese",
    dotClass: "bg-subject-chinese",
  },
  english: {
    label: "英语",
    icon: "🌎",
    chipClass: "border-subject-english/60 bg-subject-english/20 text-subject-english",
    dotClass: "bg-subject-english",
  },
  mixed: {
    label: "综合",
    icon: "✨",
    chipClass: "border-subject-mixed/60 bg-subject-mixed/20 text-subject-mixed",
    dotClass: "bg-subject-mixed",
  },
};

export function subjectMeta(subject: string) {
  return SUBJECT_META[subject as Subject] ?? SUBJECT_META.mixed;
}
