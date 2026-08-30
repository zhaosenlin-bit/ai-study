import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/appStore";
import { Badge } from "@/components/ui/badge";
import { BackgroundMusic } from "@/components/layout/BackgroundMusic";
import { LOGIN_STORAGE_KEY } from "@/pages/LoginPage";

export function TopBar() {
  const navigate = useNavigate();
  const { studentId, studentName, streakDays, modelProvider } = useAppStore();

  function reLogin() {
    localStorage.removeItem(LOGIN_STORAGE_KEY);
    useAppStore.setState({ studentId: "stu_demo_001", studentName: "小明" });
    navigate("/login");
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
          模型：{modelProvider === "mock" ? "minimax" : modelProvider}
        </Badge>
      </div>

      {/* 右侧：学习状态 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground/85">
          <span aria-hidden>🔥</span>
          连续 {streakDays} 天
        </div>
        <BackgroundMusic />
        <button
          type="button"
          onClick={reLogin}
          title="点击重新登录"
          className="flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-white/10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-subject-math text-sm font-black text-white shadow-[0_0_14px_rgba(139,92,246,0.5)]">
            {studentName.slice(0, 1)}
          </div>
          <div className="hidden leading-tight text-left sm:block">
            <div className="text-sm font-bold text-foreground">{studentName}</div>
            <div className="text-xs text-muted-foreground">
              {studentId === "stu_demo_002"
                ? "五年级 · 小学"
                : studentId === "stu_demo_001"
                  ? "四年级 · 小学"
                  : "小学"}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
