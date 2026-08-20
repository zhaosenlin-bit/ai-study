import { Outlet } from "react-router-dom";
import { BottomBar } from "@/components/layout/BottomBar";
import { LeftRail, RightRail } from "@/components/layout/EdgeRail";
import { TopBar } from "@/components/layout/TopBar";

/** 沉浸式背景：深空渐变 + 柔和光斑 + 星点 */
function StageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,hsl(262_50%_18%_/_0.55),transparent_60%),radial-gradient(800px_500px_at_85%_110%,hsl(220_60%_18%_/_0.4),transparent_60%),radial-gradient(700px_500px_at_10%_100%,hsl(262_40%_15%_/_0.45),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10%_20%,rgba(255,255,255,0.5),transparent),radial-gradient(1px_1px_at_30%_70%,rgba(255,255,255,0.35),transparent),radial-gradient(1.5px_1.5px_at_55%_15%,rgba(255,255,255,0.4),transparent),radial-gradient(1px_1px_at_75%_45%,rgba(255,255,255,0.3),transparent),radial-gradient(1.5px_1.5px_at_88%_75%,rgba(255,255,255,0.4),transparent),radial-gradient(1px_1px_at_15%_85%,rgba(255,255,255,0.35),transparent)]" />
    </div>
  );
}

/** 沉浸式学习空间：中央舞台 + 左右边缘功能 + 顶部状态 + 底部操作 */
export function AppShell() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <StageBackground />
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <LeftRail />
        <main className="relative min-w-0 flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
        <RightRail />
      </div>
      <BottomBar />
    </div>
  );
}
