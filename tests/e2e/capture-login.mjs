/**
 * 登录页临时验证脚本：截图 + 走一遍登录闭环
 * 用法：先启动 apps/web dev server（5174），再运行本脚本。
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:5174";
const OUT = new URL("../../docs/demo/screenshots/login/", import.meta.url).pathname.replace(/^\/([A-Za-z]):\//, "$1:/");

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

// 1. 桌面端登录页
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(BASE + "/login", { waitUntil: "networkidle" });
await desktop.waitForTimeout(800);
await desktop.screenshot({ path: `${OUT}login-desktop.png` });
console.log("captured: login-desktop");

// 2. 手机登录 tab
await desktop.getByRole("button", { name: "手机登录" }).click();
await desktop.waitForTimeout(400);
await desktop.screenshot({ path: `${OUT}login-phone-tab.png` });
console.log("captured: login-phone-tab");
await desktop.getByRole("button", { name: "账号登录" }).click();

// 3. 注册模式
await desktop.getByRole("button", { name: "立即注册" }).click();
await desktop.waitForTimeout(400);
await desktop.screenshot({ path: `${OUT}login-register.png` });
console.log("captured: login-register");
await desktop.getByRole("button", { name: "返回登录" }).click();

// 4. 演示学生快速登录 → 首页
await desktop.getByRole("button", { name: "小明", exact: true }).first().click();
await desktop.waitForURL("**/");
await desktop.waitForTimeout(900);
await desktop.screenshot({ path: `${OUT}home-logged-in.png` });
console.log("captured: home-logged-in (after login)");

// 5. 退出登录 → 首页显示登录按钮
await desktop.getByRole("button", { name: "退出登录" }).click();
await desktop.waitForTimeout(400);
await desktop.screenshot({ path: `${OUT}home-logged-out.png` });
console.log("captured: home-logged-out");

// 6. 移动端登录页
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(BASE + "/login", { waitUntil: "networkidle" });
await mobile.waitForTimeout(800);
await mobile.screenshot({ path: `${OUT}login-mobile.png` });
console.log("captured: login-mobile");

await browser.close();
console.log("done →", OUT);
