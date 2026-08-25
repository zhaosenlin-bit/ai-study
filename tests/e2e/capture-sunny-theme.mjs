/**
 * 晴空主题（蓝天+太阳+白云）验证截图：登录后截首页，再截 AppShell 页面。
 * 用法：先启动 apps/web dev server (5174)，再 node capture-sunny-theme.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:5174";
const OUT = new URL("../../docs/demo/screenshots/sunny-check/", import.meta.url).pathname.replace(/^\/([A-Za-z]):\//, "$1:/");

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// 登录页（未登录直接可访问）
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}login.png` });
console.log("captured: login");

// 演示学生快速登录 → 首页
await page.getByRole("button", { name: "小明" }).click();
await page.waitForURL(BASE + "/");
await page.waitForTimeout(1100);
await page.screenshot({ path: `${OUT}home.png` });
console.log("captured: home");

// AppShell 页面
for (const [name, path] of [["diagnosis", "/diagnosis"], ["chat-math", "/chat/math"]]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log("captured:", name);
}
await browser.close();
