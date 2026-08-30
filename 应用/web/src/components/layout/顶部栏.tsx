import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/应用状态";
import { 徽章 } from "@/components/ui/徽章";
import { cn } from "@/lib/工具函数";

export function 顶部栏() {
  const { studentName, streakDays, modelProvider, grade, role } = useAppStore();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function logout() {
    localStorage.removeItem("ai-study-user");
    nav("/login", { replace: true });
  }

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-background/80 px-4 backdrop-blur-md md:bg-background/60">
      {/* 左侧：项目名 + 移动端菜单按钮 */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* 移动端汉堡菜单 */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-foreground transition hover:bg-white/10 md:hidden"
          aria-label="打开菜单"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🚀
          </span>
          <h1 className="text-base font-black tracking-wide text-foreground">
            ai-study
            <span className="ml-2 hidden text-xs font-medium text-muted-foreground lg:inline">
              AI 学习伙伴
            </span>
          </h1>
        </div>
        <徽章 className="hidden border-primary/30 bg-primary/10 text-primary sm:inline-flex">
          <span
            className={
              modelProvider === "mock"
                ? "h-1.5 w-1.5 rounded-full bg-primary"
                : "h-1.5 w-1.5 animate-pulse rounded-full bg-subject-english"
            }
          />
          {modelProvider === "mock" ? "Mock" : modelProvider}
        </徽章>
        {role === "parent" && (
          <徽章 className="hidden border-subject-chinese/40 bg-subject-chinese/15 text-subject-chinese lg:inline-flex">
            👨‍👩‍👦 家长模式
          </徽章>
        )}
      </div>

      {/* 右侧：学习状态 */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* 连续学习天数 - 桌面端显示 */}
        <div className="hidden items-center gap-1.5 text-sm font-semibold text-foreground/85 md:flex">
          <span aria-hidden>🔥</span>
          <span>连续 {streakDays} 天</span>
        </div>

        {/* 用户信息 */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-subject-math text-sm font-black text-white shadow-[0_0_14px_rgba(139,92,246,0.5)]">
            {studentName.slice(0, 1)}
          </div>
          <div className="hidden leading-tight lg:block">
            <div className="text-sm font-bold text-foreground">{studentName}</div>
            {role === "parent" ? (
              <div className="text-xs text-muted-foreground">家长账号</div>
            ) : (
              <button
                onClick={() => nav("/setup/grade")}
                className={	ext-xs transition hover:underline }
              >
                {[3, 4, 5, 6].includes(grade)
                  ? ${["", "", "三年级", "四年级", "五年级", "六年级"][grade]} · 小学
                  : "未选年级"}
              </button>
            )}
          </div>
        </div>

        {/* 退出按钮 - 桌面端显示 */}
        <button
          onClick={logout}
          className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-white/10 hover:text-foreground md:flex"
          title="退出登录"
        >
          退出
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-white/8 bg-background/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col p-4">
            {/* 用户信息 */}
            <div className="mb-3 flex items-center gap-3 border-b border-white/8 pb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-subject-math text-lg font-black text-white">
                {studentName.slice(0, 1)}
              </div>
              <div>
                <div className="font-bold text-foreground">{studentName}</div>
                <div className="text-xs text-muted-foreground">
                  {role === "parent" ? "家长模式" : [3, 4, 5, 6].includes(grade) ? ${["", "", "三年级", "四年级", "五年级", "六年级"][grade]} · 小学 : "未选年级"}
                </div>
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>🔥</span> 连续 {streakDays} 天学习
            </div>
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-white/10 hover:text-foreground"
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </header>
  );
}