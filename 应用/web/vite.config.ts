import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@contracts": fileURLToPath(new URL("../../包/contracts/src", import.meta.url)),
    },
  },
  server: {
    // 本机 5173 被其他项目占用，统一使用 5174（与 测试/e2e 配置一致）
    port: 5174,
    proxy: {
      // 联调阶段：/api 转发到 FastAPI 网关（角色 A）
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ["echarts"],
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "zustand",
            "@tanstack/react-query",
          ],
        },
      },
    },
  },
});
