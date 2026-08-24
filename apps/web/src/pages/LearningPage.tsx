/** 学习进度页：课程列表（3 口算 75 题 + 3 应用题交替，严格顺序解锁）。 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Course } from "@contracts";
import { realGetCourses } from "@/api/courses";
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

export function LearningPage() {
  const nav = useNavigate();
  const { studentId, grade, setCompanion } = useAppStore();
  const [subject, setSubject] = useState<"math" | "chinese" | "english">("math");

  const { data, isLoading } = useQuery({
    queryKey: ["courses", subject, studentId, grade],
    queryFn: () => realGetCourses(subject, studentId, grade),
    enabled: [3, 4, 5, 6].includes(grade),
  });

  const completedCount = data?.courses.filter((c) => c.completed).length ?? 0;

  function pick(course: Course) {
    if (course.locked) return;
    setCompanion(`开始：${course.name}`, "greeting");
    nav(`/course/${subject}/${course.course_id}`);
  }

  return (
    <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col gap-5 py-2">
      {/* 左侧内容区 */}
      <div className="flex flex-col gap-5 md:max-w-3xl">
        {/* 课程标题 + 学科 Tab */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground">
              学习进度 · {SUBJECTS.find((s) => s.value === subject)?.label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {[3, 4, 5, 6].includes(grade)
                ? `${GRADE_LABEL[grade]} · 课程按顺序解锁 · 已完成 ${completedCount}/${data?.courses.length ?? 0}`
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

        {/* 说明条 */}
        <div className="rounded-2xl bg-white/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground ring-1 ring-white/10">
          课程规则：每 3 门口算课（各 75 题）后跟 3 门经典应用题课，交替进行。每门课<b className="text-foreground">全部答对</b>才算完成，完成后自动解锁下一门。
        </div>

        {/* 课程列表 */}
        {isLoading && (
          <div className="rounded-2xl bg-white/5 p-6 text-center text-sm text-muted-foreground ring-1 ring-white/10">
            加载中…
          </div>
        )}

        {data && data.courses.length === 0 && (
          <div className="rounded-2xl bg-white/5 p-8 text-center ring-1 ring-white/10">
            <div className="text-3xl">📭</div>
            <div className="mt-2 font-semibold text-foreground">该年级暂无{SUBJECTS.find((s) => s.value === subject)?.label}课程</div>
          </div>
        )}

        {data && data.courses.length > 0 && (
          <ol className="space-y-2">
            {data.courses.map((course) => (
              <CourseCard
                key={course.course_id}
                subject={subject}
                course={course}
                onPick={() => pick(course)}
              />
            ))}
          </ol>
        )}
      </div>

      {/* AI 伙伴：缩小后固定在右上角 */}
      <div className="absolute right-0 top-0 hidden md:block">
        <AiCompanion size={44} showBubble={false} />
      </div>
    </div>
  );
}

function CourseCard({
  subject,
  course,
  onPick,
}: {
  subject: string;
  course: Course;
  onPick: () => void;
}) {
  const disabled = course.locked;
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={onPick}
        className={`group flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r p-4 text-left ring-1 backdrop-blur transition ${
          SUBJECT_TINT[subject]
        } ${
          disabled ? "cursor-not-allowed opacity-45" : "hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]"
        }`}
      >
        {/* 序号圆标 */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
            course.completed
              ? "bg-subject-english/20 text-subject-english"
              : disabled
                ? "bg-white/5 text-muted-foreground"
                : "bg-white/10 text-foreground"
          }`}
        >
          {course.completed ? "✓" : disabled ? "🔒" : course.index + 1}
        </div>

        {/* 信息 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={`truncate font-semibold ${disabled ? "text-muted-foreground" : "text-foreground"}`}>
              {course.name}
            </div>
            <Badge
              className={
                course.kind === "oral"
                  ? "border-subject-math/40 bg-subject-math/15 text-subject-math"
                  : "border-subject-chinese/40 bg-subject-chinese/15 text-subject-chinese"
              }
            >
              {course.kind === "oral" ? (subject === "math" ? "口算" : "基础") : subject === "math" ? "应用" : "拓展"}
            </Badge>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {course.question_count} 题 · {course.completed ? "已完成" : disabled ? "完成前置课程后解锁" : "点击开始"}
          </div>
        </div>

        {/* 右侧箭头 */}
        {!disabled && !course.completed && (
          <div className="text-2xl text-foreground/40 transition group-hover:translate-x-1 group-hover:text-foreground">
            ›
          </div>
        )}
      </button>
    </li>
  );
}
