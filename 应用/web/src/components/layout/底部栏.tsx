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

/** 移动端底部导航 Tab（始终显示） */
const MOBILE_TABS: { to: string; icon: string; label: string; role?: "student" | "parent" }[] = [
  { to: "/learn", icon: "🏠", label: "首页" },
  { to: "/textbook", icon: "📖", label: "教材" },
  { to: "/diagnosis", icon: "🧪", label: "诊断" },
  { to: "/chat/math", icon: "📚", label: "辅导" },
  { to: "/mistakes", icon: "📒", label: "错题" },
  { to: "/report", icon: "📊", label: "报告", role: "parent" },
];

/** 移动端底部导航（始终显示） */
function MobileBottomNav() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const role = useAppStore((s) => s.role);
  const tabs = MOBILE_TABS.filter((t) => !t.role || t.role === role);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 shrink-0 items-stretch border-t border-white/8 bg-background/95 backdrop-blur-md lg:hidden">
      {tabs.map((t) => {
        // 精确匹配首页，其他按前缀匹配
        const isHome = t.to === "/learn";
        const active = isHome 
          ? pathname === "/learn" || pathname === "/home" || pathname === "/" || pathname.endsWith("/learn")
          : pathname.startsWith(t.to.split("/").slice(0, 2).join("/"));
        
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
            <span className="text-xl leading-none" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

/** 桌面端情境操作栏（仅 lg 及以上显示） */
function DesktopActions() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  let actions: Action[] = [];
  let hint = "";

  if (pathname === "/" || pathname === "/home" || pathname === "/learn") {
    hint = "准备好开始今天的学习了吗？";
    actions = [
      { label: "开始三科诊断", icon: "🧪", primary: true, onClick: () => navigate("/diagnosis") },
    ];
  } else if (pathname === "/diagnosis") {
    hint = "跟随 AI 伙伴完成诊断，找出薄弱点";
  } else if (pathname.startsWith("/chat/")) {
    hint = "答错也没关系，AI 伙伴会分步引导你";
    actions = [{ label: "回到首页", onClick: () => navigate("/learn") }];
  } else if (pathname === "/path") {
    hint = "先攻克最薄弱的环节，效率更高";
    actions = [{ label: "去辅导薄弱点", icon: "🧑‍🏫", primary: true, onClick: () => navigate("/chat/math") }];
  } else if (pathname === "/mistakes") {
    hint = "错题是复习的最好教材";
    actions = [{ label: "开始复习错题", icon: "🔁", primary: true, onClick: () => navigate("/chat/math") }];
  } else if (pathname === "/report") {
    hint = "家长可以随时查看孩子的学习报告";
    actions = [{ label: "查看学习路径", onClick: () => navigate("/path") }];
  } else if (pathname === "/textbook") {
    hint = "教材配合课堂学习效果更好哦";
    actions = [{ label: "开始学习", icon: "📚", primary: true, onClick: () => navigate("/chat/math") }];
  }

  if (pathname === "/demo") return null;

  return (
    <footer className="relative z-20 hidden h-16 shrink-0 items-center justify-between gap-4 border-t border-white/8 bg-background/60 px-6 backdrop-blur-md lg:flex">
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
      {/* 移动端底部导航 - 始终显示 */}
      <MobileBottomNav />
      {/* 桌面端操作栏 - 仅大屏显示 */}
      <DesktopActions />
    </>
  );
}