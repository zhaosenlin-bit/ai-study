import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { realGetCourses } from "@/api/课程";
import { cn } from "@/lib/工具函数";
import { useAppStore } from "@/stores/应用状态";

export interface RailItem {
  to: string;
  icon: string;
  label: string;
  matchPrefix?: string;
}

/** 家长左侧导航（保持简洁图标栏） */
const PARENT_LEFT: RailItem[] = [{ to: "/home", icon: "🧑‍💼", label: "家长看板", matchPrefix: "/home" }];

/** 学生顶部导航（三科已放入题目目录，这里只留通用入口） */
const STUDENT_TOP: RailItem[] = [
  { to: "/learn", icon: "📚", label: "学习进度", matchPrefix: "/learn" },
  { to: "/path", icon: "🗺️", label: "知识地图" },
];

const RIGHT_ITEMS: RailItem[] = [
  { to: "/mistakes", icon: "📒", label: "错题本" },
  { to: "/report", icon: "📊", label: "家长报告" },
  { to: "/demo", icon: "🎬", label: "演示控制台" },
];

const SUBJECT_META: Record<string, { label: string; icon: string }> = {
  math: { label: "数学", icon: "🔢" },
  chinese: { label: "语文", icon: "📖" },
  english: { label: "英语", icon: "🌎" },
};
const SUBJECT_ORDER = ["math", "chinese", "english"] as const;

function isActive(item: RailItem, pathname: string) {
  if (item.to === "/") return pathname === "/";
  if (item.matchPrefix) return pathname.startsWith(item.matchPrefix);
  return pathname.startsWith(item.to);
}

function Rail({ items, side }: { items: RailItem[]; side: "left" | "right" }) {
  const { pathname } = useLocation();
  return (
    <nav
      className={cn(
        "z-10 hidden w-[72px] shrink-0 flex-col items-center gap-3 border-white/8 px-2 py-4 md:flex",
        side === "left" ? "border-r" : "border-l",
      )}
      aria-label={side === "left" ? "学习导航" : "功能导航"}
    >
      {items.map((item) => {
        const active = isActive(item, pathname);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn("edge-button flex-col gap-0.5 text-[10px] font-semibold", active && "edge-button-active")}
            title={item.label}
          >
            <span className="text-lg leading-none" aria-hidden>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

/** 学生：题目目录（语数英分类 + 课程列表），点课程进入做题 */
function 题目目录() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { studentId, grade } = useAppStore();
  const [openSubject, setOpenSubject] = useState<string | null>("math");

  const { data: coursesBySubject, isLoading } = useQuery({
    queryKey: ["rail-courses", studentId, grade],
    queryFn: async () => {
      const results = await Promise.all(
        SUBJECT_ORDER.map((s) => realGetCourses(s, studentId, [3, 4, 5, 6].includes(grade) ? grade : 4)),
      );
      return Object.fromEntries(SUBJECT_ORDER.map((s, i) => [s, results[i].courses]));
    },
    enabled: [3, 4, 5, 6].includes(grade),
  });

  return (
    <aside className="z-10 hidden w-60 shrink-0 flex-col border-r border-white/8 bg-background/40 py-3 md:flex">
      {/* 顶部通用入口 */}
      <div className="flex flex-col gap-1 px-2 pb-3">
        {STUDENT_TOP.map((item) => {
          const active = isActive(item, pathname);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground",
                active && "bg-white/8 text-foreground",
              )}
              title={item.label}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <div className="border-t border-white/8 px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        题目目录
      </div>

      {/* 语数英分类 */}
      <div className="flex-1 overflow-y-auto px-2">
        {isLoading && <div className="px-3 py-2 text-xs text-muted-foreground">加载中…</div>}
        {SUBJECT_ORDER.map((subj) => {
          const meta = SUBJECT_META[subj];
          const open = openSubject === subj;
          const courses = coursesBySubject?.[subj] ?? [];
          return (
            <div key={subj} className="mb-1">
              <button
                type="button"
                onClick={() => setOpenSubject(open ? null : subj)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden>{meta.icon}</span>
                  {meta.label}
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {courses.filter((c) => c.completed).length}/{courses.length}
                  </span>
                </span>
                <span className={cn("text-xs text-muted-foreground transition-transform", open && "rotate-90")}>›</span>
              </button>

              {open && (
                <ul className="mb-1 ml-2 space-y-0.5 border-l border-white/8 pl-2">
                  {courses.map((c) => {
                    const active = pathname.includes(c.course_id);
                    const disabled = c.locked;
                    return (
                      <li key={c.course_id}>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => !disabled && nav(`/course/${subj}/${c.course_id}`)}
                          title={c.name}
                          className={cn(
                            "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition",
                            disabled
                              ? "cursor-not-allowed text-muted-foreground/50"
                              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                            active && "bg-white/8 text-foreground",
                          )}
                        >
                          <span aria-hidden>{c.completed ? "✅" : disabled ? "🔒" : "📝"}</span>
                          <span className="truncate">{c.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export function 左侧导航() {
  const role = useAppStore((s) => s.role);
  return role === "parent" ? <Rail items={PARENT_LEFT} side="left" /> : <题目目录 />;
}

export function 右侧导航() {
  return <Rail items={RIGHT_ITEMS} side="right" />;
}
