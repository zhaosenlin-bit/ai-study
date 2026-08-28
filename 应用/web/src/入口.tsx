import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { 应用路由 } from "@/应用路由";
import "@/全局样式.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface BoundaryState { error: Error | null }
class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };
  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: "#fff", background: "#0a0f1f", minHeight: "100vh", fontSize: 14, lineHeight: 1.6 }}>
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>页面出错了</h1>
          <pre style={{ background: "rgba(255,0,0,0.15)", padding: 16, borderRadius: 8, whiteSpace: "pre-wrap" }}>
            {String(this.state.error?.message ?? this.state.error)}
          </pre>
          <p style={{ marginTop: 16, color: "#aaa" }}>请按 Ctrl+Shift+R 强刷，或截图发给我排查。</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <应用路由 />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);