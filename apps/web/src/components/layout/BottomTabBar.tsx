import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Tab {
  to: string;
  icon: string;
  label: string;
  matchPrefix?: string;
}

const PRIMARY_TABS: Tab[] = [
  { to: "/", icon: "🏠", label: "首页", matchPrefix: "/" },
  { to: "/chat/math", icon: "🔢", label: "数学" },
  { to: "/chat/chinese", icon: "📖", label: "语文" },
  { to: "/chat/english", icon: "🌎", label: "英语" },
  { to: "/path", icon: "🗺️", label: "路径" },
];

const MORE_TABS: Tab[] = [
  { to: "/mistakes", icon: "📒", label: "错题本" },
  { to: "/report", icon: "📊", label: "家长报告" },
  { to: "/demo", icon: "🎬", label: "演示控制台" },
];

/** 三科切换的快速入口（移动端第二/三/四个 tab） */
function SubjectTab({ to, icon, label, isActive }: Tab & { isActive: boolean }) {
  return (
    <NavLink
      to={to}
      className={cn(
        "flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-muted-foreground transition-colors active:scale-95",
        isActive && "text-primary",
      )}
    >
      <span className="text-xl leading-none" aria-hidden>
        {icon}
      </span>
      <span className="leading-none">{label}</span>
    </NavLink>
  );
}

function isActive(item: Tab, pathname: string) {
  if (item.to === "/") return pathname === "/";
  if (item.matchPrefix) return pathname.startsWith(item.matchPrefix);
  return pathname.startsWith(item.to);
}

/** 移动端底部 tab bar：5 个主 tab + 右上角"更多"入口（弹层） */
export function BottomTabBar() {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* 浮层：更多功能 */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden
        />
      )}
      {moreOpen && (
        <div className="fixed bottom-16 right-3 z-40 flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-2xl md:hidden animate-fade-in">
          {MORE_TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              onClick={() => setMoreOpen(false)}
              className="flex min-h-[44px] items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-white/10"
            >
              <span className="text-lg leading-none" aria-hidden>
                {t.icon}
              </span>
              {t.label}
            </NavLink>
          ))}
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] items-center border-t border-border bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 4px)" }}
        aria-label="底部主导航"
      >
        {PRIMARY_TABS.map((t) => (
          <SubjectTab key={t.to} {...t} isActive={isActive(t, pathname)} />
        ))}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          aria-label="更多功能"
          aria-expanded={moreOpen}
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-muted-foreground transition-colors active:scale-95"
        >
          <span className="text-xl leading-none" aria-hidden>
            ☰
          </span>
          <span className="leading-none">更多</span>
        </button>
      </nav>
    </>
  );
}
