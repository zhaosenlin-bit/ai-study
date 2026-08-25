/** 最终验证：登录后首页 / AppShell 页面均含天空渐变+太阳+3朵云 */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:5174";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function check(path, label) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const clouds = [...document.querySelectorAll(".sky-cloud")];
    return {
      skyGrad: !!document.querySelector("[class*='7ec9f2']") || !!document.querySelector(".bg-gradient-to-b"),
      sun: document.querySelectorAll(".sky-sun").length,
      clouds: clouds.length,
      cloudPos: clouds.map((c) => Math.round(c.getBoundingClientRect().x) + "," + Math.round(c.getBoundingClientRect().y)),
    };
  });
  console.log(label, JSON.stringify(r));
}

// 登录
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "小明" }).click();
await page.waitForURL(BASE + "/");
await check("/", "home    ");
await check("/diagnosis", "diag    ");
await check("/chat/math", "chat    ");
await check("/mistakes", "mistakes");

// 登录页（未登录态单独验证）
await page.evaluate(() => localStorage.clear());
await check("/login", "login   ");
await browser.close();
