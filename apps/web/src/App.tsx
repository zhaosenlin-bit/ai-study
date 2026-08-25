import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPage } from "@/pages/ChatPage";
import { ClassroomPage } from "@/pages/ClassroomPage";
import { DemoConsolePage } from "@/pages/DemoConsolePage";
import { DiagnosisPage } from "@/pages/DiagnosisPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { MistakesPage } from "@/pages/MistakesPage";
import { PathPage } from "@/pages/PathPage";
import { ReportPage } from "@/pages/ReportPage";
import { TextbookPage } from "@/pages/TextbookPage";
import { WeeklyQuizPage } from "@/pages/WeeklyQuizPage";

export function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      {/* 除登录页外全部收进登录守卫：未登录或会话过期直接跳登录页 */}
      <Route element={<RequireAuth />}>
        <Route index element={<HomePage />} />
        <Route element={<AppShell />}>
          <Route path="diagnosis" element={<DiagnosisPage />} />
          <Route path="chat/:subject" element={<ChatPage />} />
          <Route path="classroom/:subject/:kpId" element={<ClassroomPage />} />
          <Route path="path" element={<PathPage />} />
          <Route path="textbooks" element={<TextbookPage />} />
          <Route path="weekly-quiz" element={<WeeklyQuizPage />} />
          <Route path="mistakes" element={<MistakesPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="demo" element={<DemoConsolePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
