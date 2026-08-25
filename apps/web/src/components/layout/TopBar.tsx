import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/hero/Logo";

export function TopBar() {
  const navigate = useNavigate();
  const { studentName, grade, streakDays, modelProvider, isLoggedIn, logout } = useAppStore();
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/70 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <LogoMark className="h-7 w-7" />
          <h1 className="text-base font-black tracking-wide text-foreground">
            ai-study
            <span className="ml-2 hidden text-xs font-medium text-muted-foreground sm:inline">
              AI 学习伙伴
            </span>
          </h1>
        </div>
        <Badge className="hidden border-primary/20 bg-primary/10 text-primary sm:inline-flex">
          <span className={modelProvider === "mock" ? "h-1.5 w-1.5 rounded-full bg-primary" : "h-1.5 w-1.5 animate-pulse rounded-full bg-subject-english"} />
          模型：{modelProvider === "mock" ? "Mock" : modelProvider}
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground/85">
              <span aria-hidden>🔥</span>连续 {streakDays} 天
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-leaf to-orange text-sm font-black text-white shadow-[0_0_14px_rgba(217,119,6,0.35)]">
                {studentName.slice(0, 1)}
              </div>
              <div className="hidden leading-tight sm:block">
                <div className="text-sm font-bold text-foreground">{studentName}</div>
                <div className="text-xs text-muted-foreground">{grade} 年级 · 小学</div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="退出登录"
              aria-label="退出登录"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/70 text-muted-foreground transition hover:border-primary/30 hover:text-primary active:scale-95"
            >
              <LogOut size={16} strokeWidth={2.4} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e8830c] px-5 py-2 text-sm font-bold text-white shadow-[0_6px_16px_rgba(217,119,6,0.32)] transition hover:bg-[#d97706] active:scale-95"
          >
            登录
          </button>
        )}
      </div>
    </header>
  );
}
