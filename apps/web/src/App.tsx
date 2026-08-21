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

function hasUser(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("ai-study-user"));
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  if (!hasUser()) {
    window.location.replace("/login");
    return null;
  }
  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
