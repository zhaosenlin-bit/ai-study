import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/appStore";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  const { studentName, streakDays, modelProvider, grade } = useAppStore();
  const nav = useNavigate();

  function logout() {
    localStorage.removeItem("ai-study-user");
    nav("/login", { replace: true });
  }

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-background/60 px-4 backdrop-blur-md">
      {/* 左侧：项目名 + 模型状态 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🚀
          </span>
          <h1 className="text-base font-black tracking-wide text-foreground">
            ai-study
            <span className="ml-2 hidden text-xs font-medium text-muted-foreground sm:inline">
              AI 学习伙伴
            </span>
          </h1>
        </div>
        <Badge className="border-primary/30 bg-primary/10 text-primary">
          <span
            className={
              modelProvider === "mock"
                ? "h-1.5 w-1.5 rounded-full bg-primary"
                : "h-1.5 w-1.5 animate-pulse rounded-full bg-subject-english"
            }
          />
          模型：{modelProvider === "mock" ? "Mock" : modelProvider}
        </Badge>
      </div>

      {/* 右侧：学习状态 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground/85">
          <span aria-hidden>🔥</span>
          连续 {streakDays} 天
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-subject-math text-sm font-black text-white shadow-[0_0_14px_rgba(139,92,246,0.5)]">
            {studentName.slice(0, 1)}
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-bold text-foreground">{studentName}</div>
            <button
              onClick={() => nav("/setup/grade")}
              title={[3, 4, 5, 6].includes(grade) ? "点击修改年级" : "尚未选择年级，点击选择"}
              className={`text-xs transition hover:underline ${
                [3, 4, 5, 6].includes(grade) ? "text-muted-foreground" : "font-semibold text-amber-500"
              }`}
            >
              {[3, 4, 5, 6].includes(grade)
                ? `${["", "", "三年级", "四年级", "五年级", "六年级"][grade]} · 小学（点击修改）`
                : "未选年级 · 点此选择"}
            </button>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-white/10 hover:text-foreground"
          title="退出登录"
        >
          <span aria-hidden>⇥</span>
          退出
        </button>
      </div>
    </header>
  );
}
