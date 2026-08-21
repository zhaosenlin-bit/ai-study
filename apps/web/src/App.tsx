import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPage } from "@/pages/ChatPage";
import { DemoConsolePage } from "@/pages/DemoConsolePage";
import { DiagnosisPage } from "@/pages/DiagnosisPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { MistakesPage } from "@/pages/MistakesPage";
import { PathPage } from "@/pages/PathPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ReportPage } from "@/pages/ReportPage";
import { SetupGradePage } from "@/pages/SetupGradePage";
import { getMe } from "@/api/me";
import { useAppStore } from "@/stores/appStore";
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

/** 顶层：如有本地登录态，启动时从 /me 拉取最新 grade/displayName 同步到 store。 */
function useBootstrapUser() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;
    getMe(user.user_id)
      .then((me) => setCurrentUser({ userId: me.student.student_id, displayName: me.display_name, grade: me.student.grade }))
      .catch(() => {
        // 远端失败（如后端重启）保持默认 store，不影响 UI
      });
  }, [setCurrentUser]);
}

export function App() {
  useBootstrapUser();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/setup/grade"
        element={
          <RequireAuth>
            <SetupGradePage />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="diagnosis" element={<DiagnosisPage />} />
        <Route path="chat/:subject" element={<ChatPage />} />
        <Route path="path" element={<PathPage />} />
        <Route path="mistakes" element={<MistakesPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="demo" element={<DemoConsolePage />} />
      </Route>
    </Routes>
  );
}
