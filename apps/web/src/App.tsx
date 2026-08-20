import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPage } from "@/pages/ChatPage";
import { DemoConsolePage } from "@/pages/DemoConsolePage";
import { DiagnosisPage } from "@/pages/DiagnosisPage";
import { HomePage } from "@/pages/HomePage";
import { MistakesPage } from "@/pages/MistakesPage";
import { PathPage } from "@/pages/PathPage";
import { ReportPage } from "@/pages/ReportPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
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
