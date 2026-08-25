import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isSessionExpired, useAppStore } from "@/stores/appStore";

/**
 * 登录守卫：未登录或会话过期（间隔 SESSION_HOURS 小时未访问）→ 跳转登录页。
 * 包裹所有需登录的页面，登录后可通过 state.from 回到原页面。
 */
export function RequireAuth() {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const logout = useAppStore((s) => s.logout);
  const location = useLocation();

  // 停留期间会话过期的复查（刷新页面时由 initAuth 兜底）
  useEffect(() => {
    if (isLoggedIn && isSessionExpired()) logout();
  }, [isLoggedIn, logout]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
