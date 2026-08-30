import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LOGIN_STORAGE_KEY } from "@/pages/LoginPage";
import { useAppStore } from "@/stores/appStore";

/** 路由守卫：未登录跳转 /login，登录后可访问主应用。 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const logged = localStorage.getItem(LOGIN_STORAGE_KEY);
  const loc = useLocation();

  // 刷新/重新打开时从 localStorage 恢复登录昵称，避免 TopBar 回退到默认"小明"
  useEffect(() => {
    if (!logged) return;
    try {
      const data = JSON.parse(logged);
      if (data?.name && data.name !== useAppStore.getState().studentName) {
        useAppStore.setState({ studentId: data.name, studentName: data.name });
      }
    } catch {
      /* 忽略损坏的本地登录数据 */
    }
  }, [logged]);

  if (!logged) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <>{children}</>;
}
