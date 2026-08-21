import { defineConfig } from "@playwright/test";

/**
 * 端到端测试配置：自动启动 Vite 开发服务器，跑完自动关闭。
 * 首次运行前需安装浏览器：npx playwright install chromium
 */
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5174",
    trace: "retain-on-failure",
    locale: "zh-CN",
  },
  webServer: {
    command: "npm run dev --prefix ../../apps/web",
    url: "http://localhost:5174",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
