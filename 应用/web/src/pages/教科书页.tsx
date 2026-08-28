/**
 * 教科书页面：展示教材翻阅器，支持学科切换
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { TextbookViewer, textbooksFor } from "@/components/textbook/TextbookViewer";
import { 卡片, 卡片内容, 卡片头, 卡片标题 } from "@/components/ui/卡片";
import { 按钮 } from "@/components/ui/按钮";
import { useAppStore } from "@/stores/应用状态";
import { cn } from "@/lib/工具函数";

const SUBJECTS = [
  { value: "math", label: "数学", icon: "🧮" },
  { value: "chinese", label: "语文", icon: "📖" },
  { value: "english", label: "英语", icon: "🔤" },
] as const;

export function 教科书页() {
  const { grade } = useAppStore();
  const [subject, setSubject] = useState<"math" | "chinese" | "english">("math");

  const textbooks = textbooksFor(subject, grade);
  const currentTextbook = textbooks[0];

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col items-center gap-6 py-4">
      {/* AI 伙伴 */}
      <div className="w-full max-w-xl">
        <AI伙伴 />
      </div>

      {/* 标题 */}
      <div className="w-full text-center">
        <h1 className="text-2xl font-bold text-foreground">📚 教材</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {grade} 年级 · 选择学科查看对应年级的教材
        </p>
      </div>

      {/* 学科切换 */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUBJECTS.map((s) => {
          const active = subject === s.value;
          const chipClass = {
            math: "border-subject-math/40 bg-subject-math/15 text-subject-math",
            chinese: "border-subject-chinese/40 bg-subject-chinese/15 text-subject-chinese",
            english: "border-subject-english/40 bg-subject-english/15 text-subject-english",
          }[s.value];
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => setSubject(s.value as typeof subject)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95",
                active
                  ? chipClass
                  : "border-white/15 bg-white/5 text-muted-foreground hover:border-white/30",
              )}
              aria-pressed={active}
            >
              <span aria-hidden>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* 教材翻阅器 / 降级提示 */}
      <div className="w-full">
        {textbooks.length === 0 ? (
          <卡片>
            <卡片内容 className="p-8 text-center">
              <div className="mb-3 text-4xl">📚</div>
              <p className="text-sm text-muted-foreground">
                {grade} 年级{SUBJECTS.find((s) => s.value === subject)?.label}教材暂未加入
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                请联系老师获取教材图片，或尝试其他学科。
              </p>
            </卡片内容>
          </卡片>
        ) : (
          <TextbookViewer textbooks={textbooks} />
        )}
      </div>

      {/* 功能说明 */}
      <卡片>
        <卡片头>
          <卡片标题>💡 教材使用说明</卡片标题>
        </卡片头>
        <卡片内容 className="space-y-2 text-sm text-muted-foreground">
          <p>• 点击左上角下拉框可切换不同学期教材</p>
          <p>• 使用左右箭头翻页，或直接点击页面</p>
          <p>• 教材内容与课堂学习进度同步更新</p>
          <p>• 如需打印，点击图片可查看大图</p>
        </卡片内容>
      </卡片>

      {/* 返回链接 */}
      <div className="flex gap-3">
        <Link to="/">
          <按钮 variant="outline">← 返回首页</按钮>
        </Link>
        <Link to="/path">
          <按钮>查看学习路径 →</按钮>
        </Link>
      </div>
    </div>
  );
}