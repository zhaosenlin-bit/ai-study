import type { Subject } from "@contracts";

export const SUBJECT_META: Record<
  Subject,
  { label: string; icon: string; chipClass: string; dotClass: string }
> = {
  math: {
    label: "数学",
    icon: "🔢",
    chipClass: "border-subject-math/30 bg-subject-math/12 text-subject-math",
    dotClass: "bg-subject-math",
  },
  chinese: {
    label: "语文",
    icon: "📖",
    chipClass: "border-subject-chinese/30 bg-subject-chinese/12 text-subject-chinese",
    dotClass: "bg-subject-chinese",
  },
  english: {
    label: "英语",
    icon: "🌎",
    chipClass: "border-subject-english/30 bg-subject-english/12 text-subject-english",
    dotClass: "bg-subject-english",
  },
  mixed: {
    label: "综合",
    icon: "✨",
    chipClass: "border-primary/30 bg-primary/12 text-primary",
    dotClass: "bg-primary",
  },
};

export function subjectMeta(subject: string) {
  return SUBJECT_META[subject as Subject] ?? SUBJECT_META.mixed;
}
