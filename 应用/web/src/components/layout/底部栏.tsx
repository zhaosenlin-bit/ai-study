import { useLocation, useNavigate } from "react-router-dom";
import { 按钮 } from "@/components/ui/按钮";
import { useAppStore } from "@/stores/应用状态";
import { cn } from "@/lib/工具函数";

interface Action {
  label: string;
  icon?: string;
  primary?: boolean;
  onClick: () => void;
}

/** 移动端固定导航 Tab */
const MOBILE_TABS: { to: string; icon: string; label: string; role?: "student" | "parent" }[] = [
  { to: "/learn", icon: "🏠", label: "学习" },
  { to: "/chat/math", icon: "📚", label: "课程" },
  { to: "/mistakes", icon: "📒", label: "错题" },
  { to: "/report", icon: "📊", label: "报告" },
  { to: "/home", icon: "👨‍👩‍👦", label: "家长", role: "parent" },
];

/** 移动端底部导航（<md 显示） */
function MobileNav() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const role = useAppStore((s) => s.role);
  const tabs = MOBILE_TABS.filter((t) => !t.role || t.role === role);
  return (
    <footer className="z-30 flex h-16 shrink-0 items-stretch border-t border-white/8 bg-background/80 backdrop-blur-md md:hidden">
      {tabs.map((t) => {
        const active = t.to === "/home" ? pathname === "/home" : pathname.startsWith(t.to.split("/").slice(0, 2).join("/"));
        return (
          <button
            key={t.to}
            type="button"
            onClick={() => nav(t.to)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="text-lg leading-none" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        );
      })}
    </footer>
  );
}

/** 桌面端情境操作栏（≥md 显示） */
function DesktopActions() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  let actions: Action[] = [];
  let hint = "";

  if (pathname === "/") {
    hint = "准备好开始今天的学习了吗？";
    actions = [
      { label: "开始三科诊断", icon: "🧪", primary: true, onClick: () => navigate("/diagnosis") },
    ];
  } else if (pathname === "/diagnosis") {
    hint = "跟随 AI 伙伴完成诊断，找出薄弱点";
  } else if (pathname.startsWith("/chat/")) {
    hint = "答错也没关系，AI 伙伴会分步引导你";
    actions = [{ label: "回到今日任务", onClick: () => navigate("/") }];
  } else if (pathname === "/path") {
    hint = "先攻克最薄弱的环节，效率更高";
    actions = [{ label: "去辅导薄弱点", icon: "🧑‍🏫", primary: true, onClick: () => navigate("/chat/math") }];
  } else if (pathname === "/mistakes") {
    hint = "错题是复习的最好教材";
    actions = [{ label: "开始复习错题", icon: "🔁", primary: true, onClick: () => navigate("/chat/math") }];
  } else if (pathname === "/report") {
    hint = "家长可以随时查看孩子的学习报告";
    actions = [{ label: "查看学习路径", onClick: () => navigate("/path") }];
  }

  if (pathname === "/demo") return null;

  return (
    <footer className="relative z-20 hidden h-16 shrink-0 items-center justify-between gap-4 border-t border-white/8 bg-background/60 px-6 backdrop-blur-md md:flex">
      <p className="text-sm text-muted-foreground">{hint}</p>
      <div className="ml-auto flex items-center gap-3">
        {actions.map((a) => (
          <按钮 key={a.label} variant={a.primary ? "default" : "outline"} size="lg" onClick={a.onClick}>
            {a.icon && <span aria-hidden>{a.icon}</span>}
            {a.label}
          </按钮>
        ))}
      </div>
    </footer>
  );
}

export function 底部栏() {
  const { pathname } = useLocation();
  if (pathname === "/demo") return null;
  return (
    <>
      <MobileNav />
      <DesktopActions />
    </>
  );
}
