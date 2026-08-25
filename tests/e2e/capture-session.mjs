/**
 * 会话过期守卫验证：未登录拦截 / 登录放行 / 过期后刷新回登录页
 * 用法：先启动 apps/web dev server（5174），再运行本脚本。
 */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:5174";

const browser = await chromium.launch();

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("PASS:", msg);
}

// --- 场景 1：未登录访问 / → 重定向到 /login ---
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  assert(new URL(page.url()).pathname === "/login", "未登录访问 / 被重定向到 /login");
  await ctx.close();
}

// --- 场景 2：未登录访问 /diagnosis → 重定向到 /login ---
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE + "/diagnosis", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  assert(new URL(page.url()).pathname === "/login", "未登录访问 /diagnosis 被重定向到 /login");
  await ctx.close();
}

// --- 场景 3：登录后访问 / 正常，且回跳原页面 ---
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  // 未登录访问 /path → 拦截到登录页
  await page.goto(BASE + "/path", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  assert(new URL(page.url()).pathname === "/login", "未登录访问 /path 被拦截");
  // 点"小明"快速登录 → 应回到 /path
  await page.getByRole("button", { name: "小明", exact: true }).first().click();
  await page.waitForTimeout(800);
  assert(new URL(page.url()).pathname === "/path", "登录后回到被拦截的 /path");
  await ctx.close();
}

// --- 场景 4：会话过期（登录时间拨回 5 小时前）→ 刷新被弹回登录页 ---
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "小明", exact: true }).first().click();
  await page.waitForTimeout(800);
  assert(new URL(page.url()).pathname === "/", "正常登录进入首页");
  // 篡改登录时间戳为 5 小时前（超过 4 小时阈值）
  await page.evaluate(() => {
    const key = "ai-study-auth";
    const raw = localStorage.getItem(key);
    const auth = JSON.parse(raw);
    auth.at = Date.now() - 5 * 60 * 60 * 1000;
    localStorage.setItem(key, JSON.stringify(auth));
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  assert(new URL(page.url()).pathname === "/login", "会话过期后刷新被弹回登录页");
  await ctx.close();
}

// --- 场景 5：会话未过期（登录时间 1 小时前）→ 刷新仍在首页 ---
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "小明", exact: true }).first().click();
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const key = "ai-study-auth";
    const raw = localStorage.getItem(key);
    const auth = JSON.parse(raw);
    auth.at = Date.now() - 60 * 60 * 1000; // 1 小时前
    localStorage.setItem(key, JSON.stringify(auth));
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  assert(new URL(page.url()).pathname === "/", "会话未过期（1 小时前登录）刷新仍在首页");
  await ctx.close();
}

await browser.close();
console.log("\nALL SESSION GUARD TESTS PASSED");
