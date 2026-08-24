/** 学习页：学科 Tab（数学/语文/英语切换）+ 有序课时列表（按 grade 过滤）。 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { LearningItem } from "@contracts";
import { realGetLearning } from "@/api/learning";
import { AiCompanion } from "@/components/companion/AiCompanion";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/appStore";

const SUBJECTS: { value: "math" | "chinese" | "english"; label: string; icon: string }[] = [
  { value: "math", label: "数学", icon: "🔢" },
  { value: "chinese", label: "语文", icon: "📖" },
  { value: "english", label: "英语", icon: "🌎" },
];

const GRADE_LABEL = ["", "", "三年级", "四年级", "五年级", "六年级"];

const SUBJECT_TINT: Record<string, string> = {
  math: "from-subject-math/30 to-subject-math/5 ring-subject-math/40",
  chinese: "from-subject-chinese/30 to-subject-chinese/5 ring-subject-chinese/40",
  english: "from-subject-english/30 to-subject-english/5 ring-subject-english/40",
};

export function LearningPage() {
  const nav = useNavigate();
  const { studentId, grade, setCompanion } = useAppStore();
  const [subject, setSubject] = useState<"math" | "chinese" | "english">("math");

  const { data, isLoading } = useQuery({
    queryKey: ["learning", subject, studentId, grade],
    queryFn: () => realGetLearning(subject, studentId, grade),
    enabled: [3, 4, 5, 6].includes(grade),
  });

  function pick(item: LearningItem) {
    if (item.locked) return;
    setCompanion(`我们一起学：${item.name}`, "greeting");
    // 进入学科聊天页（带知识点 query），让 AI 出题练习
    nav(`/chat/${subject}?kp=${encodeURIComponent(item.id)}`);
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-5 py-2">
      {/* 标题 + 学科 Tab */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground">学习 · 课程目录</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {[3, 4, 5, 6].includes(grade)
              ? `${GRADE_LABEL[grade]} · 顺序学习，完成前置后解锁`
              : "请先在顶部选择年级"}
          </p>
        </div>
        <div className="flex rounded-xl bg-white/5 p-1 text-sm font-medium ring-1 ring-white/10 backdrop-blur">
          {SUBJECTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSubject(s.value)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                subject === s.value ? "bg-white/15 text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <AiCompanion size={60} showBubble={false} />

      {/* 课时列表 */}
      {isLoading && (
        <div className="rounded-2xl bg-white/5 p-6 text-center text-sm text-muted-foreground ring-1 ring-white/10">
          加载中…
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-2xl bg-white/5 p-8 text-center ring-1 ring-white/10">
          <div className="text-3xl">📭</div>
          <div className="mt-2 font-semibold text-foreground">该年级暂无{SUBJECTS.find((s) => s.value === subject)?.label}内容</div>
        </div>
      )}

      {data && data.items.length > 0 && (
        <ol className="space-y-2">
          {data.items.map((item, idx) => (
            <LessonCard
              key={item.id}
              index={idx + 1}
              subject={subject}
              item={item}
              onPick={() => pick(item)}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function LessonCard({
  index,
  subject,
  item,
  onPick,
}: {
  index: number;
  subject: string;
  item: LearningItem;
  onPick: () => void;
}) {
  const disabled = item.locked;
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={onPick}
        className={`group flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r p-4 text-left ring-1 backdrop-blur transition ${
          SUBJECT_TINT[subject]
        } ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]"
        }`}
      >
        {/* 序号 */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg font-black text-foreground">
          {disabled ? "🔒" : index}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate font-semibold text-foreground">{item.name}</div>
            <StatusBadge status={item.status} locked={disabled} />
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>难度 {"★".repeat(item.difficulty)}<span className="opacity-30">{"★".repeat(5 - item.difficulty)}</span></span>
            <span>·</span>
            <span>{item.question_count} 题</span>
            {item.mastery > 0 && (
              <>
                <span>·</span>
                <span>掌握度 {Math.round(item.mastery * 100)}%</span>
              </>
            )}
          </div>
        </div>

        {/* 右侧箭头 */}
        {!disabled && (
          <div className="text-2xl text-foreground/40 transition group-hover:translate-x-1 group-hover:text-foreground">
            ›
          </div>
        )}
      </button>
    </li>
  );
}

function StatusBadge({ status, locked }: { status: LearningItem["status"]; locked: boolean }) {
  if (locked) {
    return <Badge className="border-white/15 bg-white/8 text-muted-foreground">未解锁</Badge>;
  }
  if (status === "mastered") {
    return <Badge className="border-subject-english/40 bg-subject-english/15 text-subject-english">已掌握</Badge>;
  }
  if (status === "learning") {
    return <Badge className="border-subject-math/40 bg-subject-math/15 text-subject-math">学习中</Badge>;
  }
  return <Badge className="border-white/15 bg-white/8 text-muted-foreground">未开始</Badge>;
}