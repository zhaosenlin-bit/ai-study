/** 学习页（借鉴可汗学院）：课程掌握度进度条 + 单元分组 + 课时卡片网格（按 grade 过滤、学科 Tab 切换）。 */
import { useMemo, useState } from "react";
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
  math: "from-subject-math/25 to-subject-math/5 ring-subject-math/30",
  chinese: "from-subject-chinese/25 to-subject-chinese/5 ring-subject-chinese/30",
  english: "from-subject-english/25 to-subject-english/5 ring-subject-english/30",
};

const BAR_TINT: Record<string, string> = {
  math: "from-subject-math to-cyan-300",
  chinese: "from-subject-chinese to-amber-300",
  english: "from-subject-english to-emerald-300",
};

const UNIT_SIZE = 4; // 每个单元包含的课时数

export function LearningPage() {
  const nav = useNavigate();
  const { studentId, grade, setCompanion } = useAppStore();
  const [subject, setSubject] = useState<"math" | "chinese" | "english">("math");

  const { data, isLoading } = useQuery({
    queryKey: ["learning", subject, studentId, grade],
    queryFn: () => realGetLearning(subject, studentId, grade),
    enabled: [3, 4, 5, 6].includes(grade),
  });

  // 单元分组：按有序列表每 UNIT_SIZE 个一组
  const units = useMemo(() => {
    if (!data) return [];
    const groups: { title: string; items: LearningItem[] }[] = [];
    for (let i = 0; i < data.items.length; i += UNIT_SIZE) {
      const chunk = data.items.slice(i, i + UNIT_SIZE);
      const first = chunk[0];
      groups.push({
        title: `单元 ${groups.length + 1}${first ? ` · ${first.name}` : ""}`,
        items: chunk,
      });
    }
    return groups;
  }, [data]);

  // 总体掌握度：该学科该年级所有课时 mastery 平均
  const masteryPct = useMemo(() => {
    if (!data || data.items.length === 0) return 0;
    return Math.round((data.items.reduce((s, x) => s + x.mastery, 0) / data.items.length) * 100);
  }, [data]);

  const unlockedCount = data?.items.filter((x) => !x.locked).length ?? 0;
  const masteredCount = data?.items.filter((x) => x.status === "mastered").length ?? 0;

  function pick(item: LearningItem) {
    if (item.locked) return;
    setCompanion(`我们一起学：${item.name}`, "greeting");
    nav(`/chat/${subject}?kp=${encodeURIComponent(item.id)}`);
  }

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-5 py-2">
      {/* 课程标题 + 学科 Tab */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground">
            {SUBJECTS.find((s) => s.value === subject)?.label}课程
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {[3, 4, 5, 6].includes(grade)
              ? `${GRADE_LABEL[grade]} · 顺序学习，完成前置后解锁 · ${masteredCount}/${data?.items.length ?? 0} 已掌握`
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

      {/* 课程掌握度进度条（可汗学院式） */}
      {data && data.items.length > 0 && (
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">课程掌握度</span>
            <span className="text-muted-foreground">
              已解锁 {unlockedCount}/{data.items.length} 课时
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${BAR_TINT[subject]} transition-all`}
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>
      )}

      <AiCompanion size={56} showBubble={false} />

      {/* 单元分组 + 课时卡片网格 */}
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
        <div className="space-y-6">
          {units.map((unit, ui) => (
            <section key={ui}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{unit.title}</span>
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-muted-foreground">
                  {unit.items.filter((x) => x.status === "mastered").length}/{unit.items.length} 掌握
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {unit.items.map((item, idx) => (
                  <LessonCard
                    key={item.id}
                    index={(ui * UNIT_SIZE) + idx + 1}
                    subject={subject}
                    item={item}
                    onPick={() => pick(item)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
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
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      className={`flex flex-col gap-3 rounded-2xl bg-gradient-to-br p-4 text-left ring-1 backdrop-blur transition ${
        SUBJECT_TINT[subject]
      } ${
        disabled ? "cursor-not-allowed opacity-45" : "hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
      }`}
    >
      {/* 顶部：序号圆标 + 状态 */}
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-black ${
            item.status === "mastered"
              ? "bg-subject-english/20 text-subject-english"
              : disabled
                ? "bg-white/5 text-muted-foreground"
                : "bg-white/10 text-foreground"
          }`}
        >
          {item.status === "mastered" ? "✓" : disabled ? "🔒" : index}
        </div>
        <StatusBadge status={item.status} locked={disabled} />
      </div>

      {/* 名称 */}
      <div className={`min-h-10 text-sm font-semibold leading-snug ${disabled ? "text-muted-foreground" : "text-foreground"}`}>
        {item.name}
      </div>

      {/* 底部：难度 + 题数 */}
      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {"★".repeat(item.difficulty)}
          <span className="opacity-25">{"★".repeat(5 - item.difficulty)}</span>
        </span>
        <span>{item.question_count} 题{item.mastery > 0 ? ` · ${Math.round(item.mastery * 100)}%` : ""}</span>
      </div>
    </button>
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