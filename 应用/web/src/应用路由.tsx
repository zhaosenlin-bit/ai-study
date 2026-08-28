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
import { AI画像页 } from "@/pages/AI画像页";
import { 拍照改卷页 } from "@/pages/拍照改卷页";
import { 登录页 } from "@/pages/登录页";
import { 错题本页 } from "@/pages/错题本页";
import { 家长看板页 } from "@/pages/家长看板页";
import { 知识地图页 } from "@/pages/知识地图页";
import { 注册页 } from "@/pages/注册页";
import { 报告页 } from "@/pages/报告页";
import { 选择年级页 } from "@/pages/选择年级页";
import { 教科书页 } from "@/pages/教科书页";
import { getMe } from "@/api/用户信息";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
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

function 学生首页() {
  const { studentId } = useAppStore();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["ai-profile", studentId],
    queryFn: () => api.getAiProfile(studentId),
  });
  if (isLoading) return null;
  if (!profile || Object.keys(profile).length === 0) return <Navigate to="/setup/profile" replace />;
  return <今日诊断页 />;
}

/** 按登录角色分流首页：家长 → 家长看板；学生 → AI 画像/每日诊断 */
function RoleHome() {
  const role = useAppStore((s) => s.role);
  if (role === "parent") return <家长看板页 />;
  // 学生：首次引导完成 AI 画像（记住用户），之后进每日诊断
  return <学生首页 />;
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
        <Route path="setup/profile" element={<AI画像页 />} />
        <Route path="practice" element={<拍照改卷页 />} />
        <Route path="course/:subject/:courseId" element={<课程答题页 />} />
        <Route path="diagnosis" element={<诊断页 />} />
        <Route path="chat/:subject" element={<对话页 />} />
        <Route path="path" element={<知识地图页 />} />
        <Route path="mistakes" element={<错题本页 />} />
        <Route path="report" element={<报告页 />} />
        <Route path="demo" element={<演示控制台页 />} />
        <Route path="textbook" element={<教科书页 />} />
      </Route>
    </Routes>
  );
}