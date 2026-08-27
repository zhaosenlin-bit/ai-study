import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/工具函数";
import { useAppStore } from "@/stores/应用状态";

export interface RailItem {
  to: string;
  icon: string;
  label: string;
  /** 激活匹配：/chat 下的任意学科都高亮“对话” */
  matchPrefix?: string;
}

const STUDENT_LEFT: RailItem[] = [
  { to: "/learn", icon: "📚", label: "学习进度", matchPrefix: "/learn" },
  { to: "/chat/math", icon: "🔢", label: "数学" },
  { to: "/chat/chinese", icon: "📖", label: "语文" },
  { to: "/chat/english", icon: "🌎", label: "英语" },
  { to: "/path", icon: "🗺️", label: "知识地图" },
];

const PARENT_LEFT: RailItem[] = [
  { to: "/home", icon: "🧑‍💼", label: "家长看板", matchPrefix: "/home" },
];

const RIGHT_ITEMS: RailItem[] = [
  { to: "/mistakes", icon: "📒", label: "错题本" },
  { to: "/report", icon: "📊", label: "家长报告" },
  { to: "/demo", icon: "🎬", label: "演示控制台" },
];

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
        "z-10 flex w-[72px] shrink-0 flex-col items-center gap-3 border-white/8 px-2 py-4",
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

export function 左侧导航() {
  const role = useAppStore((s) => s.role);
  return <Rail items={role === "parent" ? PARENT_LEFT : STUDENT_LEFT} side="left" />;
}

export function 右侧导航() {
  return <Rail items={RIGHT_ITEMS} side="right" />;
}
