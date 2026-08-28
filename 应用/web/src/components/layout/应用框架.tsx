import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { 底部栏 } from "@/components/layout/底部栏";
import { 左侧导航, 右侧导航 } from "@/components/layout/侧边导航";
import { 顶部栏 } from "@/components/layout/顶部栏";
import { useAppStore } from "@/stores/应用状态";

/** 沉浸式背景：鲜艳深空渐变（亮紫罗兰 + 电蓝 + 玫红光斑）+ 星点 */
function StageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,hsl(262_85%_38%_/_0.6),transparent_60%),radial-gradient(800px_500px_at_85%_110%,hsl(215_95%_42%_/_0.55),transparent_60%),radial-gradient(700px_500px_at_10%_100%,hsl(330_85%_42%_/_0.55),transparent_55%),radial-gradient(500px_380px_at_70%_20%,hsl(35_100%_52%_/_0.4),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10%_20%,rgba(255,255,255,0.5),transparent),radial-gradient(1px_1px_at_30%_70%,rgba(255,255,255,0.35),transparent),radial-gradient(1.5px_1.5px_at_55%_15%,rgba(255,255,255,0.4),transparent),radial-gradient(1px_1px_at_75%_45%,rgba(255,255,255,0.3),transparent),radial-gradient(1.5px_1.5px_at_88%_75%,rgba(255,255,255,0.4),transparent),radial-gradient(1px_1px_at_15%_85%,rgba(255,255,255,0.35),transparent)]" />
    </div>
  );
}

/** 沉浸式学习空间：中央舞台 + 左右边缘功能 + 顶部状态 + 底部操作 */
export function 应用框架() {
  const nav = useNavigate();
  const grade = useAppStore((s) => s.grade);
  const role = useAppStore((s) => s.role);

  // 仅学生需要在首次登录后选年级；家长直接进家长看板
  useEffect(() => {
    if (role === "student" && grade === 0) {
      nav("/setup/grade", { replace: true });
    }
  }, [grade, role, nav]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <StageBackground />
      <顶部栏 />
      <div className="flex min-h-0 flex-1">
        <左侧导航 />
        <main className="relative min-w-0 flex-1 overflow-y-auto px-4 pb-20 pt-4 md:px-6 md:pb-6 md:pt-6">
          <Outlet />
        </main>
        <右侧导航 />
      </div>
      <底部栏 />
    </div>
  );
}
