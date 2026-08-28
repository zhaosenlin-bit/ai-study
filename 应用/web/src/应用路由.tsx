import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { 应用框架 } from "@/components/layout/应用框架";
import { 对话页 } from "@/pages/对话页";
import { 课程答题页 } from "@/pages/课程答题页";
import { 演示控制台页 } from "@/pages/演示控制台页";
import { 诊断页 } from "@/pages/诊断页";
import { 落地页 } from "@/pages/落地页";
import { 学习进度页 } from "@/pages/学习进度页";
import { 今日诊断页 } from "@/pages/今日诊断页";
import { 登录页 } from "@/pages/登录页";
import { 错题本页 } from "@/pages/错题本页";
import { 家长看板页 } from "@/pages/家长看板页";
import { 知识地图页 } from "@/pages/知识地图页";
import { 注册页 } from "@/pages/注册页";
import { 报告页 } from "@/pages/报告页";
import { 选择年级页 } from "@/pages/选择年级页";
import { getMe } from "@/api/用户信息";
import { useAppStore } from "@/stores/应用状态";
import type { UserInfo } from "@contracts";

function getStoredUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ai-study-user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  const user = getStoredUser();
  if (!user) {
    if (typeof window !== "undefined") window.location.replace("/login");
    return null;
  }
  return children;
}

/** 按登录角色分流首页：家长 → 家长看板；学生 → 学习课程目录 */
function RoleHome() {
  const role = useAppStore((s) => s.role);
  return role === "parent" ? <家长看板页 /> : <今日诊断页 />;
}

/** 根路径：未登录显示 Landing，已登录跳学习空间 */
function RootLanding() {
  const user = getStoredUser();
  if (!user) return <落地页 />;
  return <Navigate to="/home" replace />;
}

/** 顶层：如有本地登录态，启动时从 /me 拉取最新 grade/displayName 同步到 store。 */
function useBootstrapUser() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;
    getMe(user.user_id)
      .then((me) => setCurrentUser({ userId: me.student.student_id, displayName: me.display_name, grade: me.student.grade, role: me.role }))
      .catch(() => {
        // 远端失败（如后端重启）保持默认 store，不影响 UI
      });
  }, [setCurrentUser]);
}

export function 应用路由() {
  useBootstrapUser();
  return (
    <Routes>
      <Route path="/landing" element={<落地页 />} />
      <Route index element={<RootLanding />} />
      <Route path="/login" element={<登录页 />} />
      <Route path="/register" element={<注册页 />} />
      <Route
        path="/setup/grade"
        element={
          <RequireAuth>
            <选择年级页 />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <应用框架 />
          </RequireAuth>
        }
      >
        <Route path="home" element={<RoleHome />} />
        <Route path="learn" element={<学习进度页 />} />
        <Route path="diagnosis/today" element={<今日诊断页 />} />
        <Route path="course/:subject/:courseId" element={<课程答题页 />} />
        <Route path="diagnosis" element={<诊断页 />} />
        <Route path="chat/:subject" element={<对话页 />} />
        <Route path="path" element={<知识地图页 />} />
        <Route path="mistakes" element={<错题本页 />} />
        <Route path="report" element={<报告页 />} />
        <Route path="demo" element={<演示控制台页 />} />
      </Route>
    </Routes>
  );
}
