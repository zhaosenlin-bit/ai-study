import { Outlet } from "react-router-dom";
import { BottomBar } from "@/components/layout/BottomBar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { LeftRail, RightRail } from "@/components/layout/EdgeRail";
import { TopBar } from "@/components/layout/TopBar";

/** 沉浸式背景：晴空蓝天 + 太阳 + 白云 */
function StageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* 天空渐变：深蓝 → 淡蓝 → 地平线白 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7ec9f2] via-[#bfe6ff] to-[#eef9ff]" />
      {/* 太阳（右上，带光晕 + 缓慢呼吸） */}
      <div className="sky-sun absolute top-20 right-[9%] h-36 w-36 md:h-44 md:w-44" />
      {/* 白云（大小不一，缓慢漂移） */}
      <div
        className="sky-cloud absolute left-[7%] top-[15%] h-6 w-24 opacity-90"
        style={{ animation: "cloud-drift 26s ease-in-out infinite" }}
      />
      <div
        className="sky-cloud absolute right-[27%] top-[30%] h-8 w-32 opacity-80"
        style={{ animation: "cloud-drift 34s ease-in-out 2s infinite" }}
      />
      <div
        className="sky-cloud absolute bottom-[16%] left-[26%] h-5 w-20 opacity-75"
        style={{ animation: "cloud-drift 22s ease-in-out 1s infinite" }}
      />
      {/* 底部暖光（阳光洒落） */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#ffe8c2]/70 to-transparent" />
    </div>
  );
}

/** 沉浸式学习空间：中央舞台 + 左右边缘功能 + 顶部状态 + 底部操作 */
export function AppShell() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <StageBackground />
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <LeftRail />
        <main className="relative min-w-0 flex-1 overflow-y-auto px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-6">
          <Outlet />
        </main>
        <RightRail />
      </div>
      {/* 桌面端：per-route 上下文操作；移动端由 BottomTabBar 替代 */}
      <div className="relative hidden md:block">
        <BottomBar />
      </div>
      <BottomTabBar />
    </div>
  );
}
