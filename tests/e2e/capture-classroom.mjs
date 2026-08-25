/**
 * AI 互动课堂流程验证截图：走完 intro → teach → ask → quiz×2 → done 并截图。
 * 用法：先启动 apps/web dev server (5174)。
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:5174";
const OUT = new URL("../../docs/demo/screenshots/classroom/", import.meta.url).pathname.replace(/^\/([A-Za-z]):\//, "$1:/");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// 登录
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "小明" }).click();
await page.waitForURL(BASE + "/");
await page.waitForTimeout(600);

// 进入课堂：四年级数学「大数的认识」
await page.goto(BASE + "/classroom/math/math_g4_large_numbers", { waitUntil: "networkidle" });
await page.waitForTimeout(900);
const shot = (name) => page.screenshot({ path: `${OUT}${name}.png` });

await shot("01-intro");
console.log("shot: 01-intro");

// teach
await page.getByRole("button", { name: /开始上课/ }).click();
await page.waitForTimeout(600);
await shot("02-teach");
console.log("shot: 02-teach");

// ask
await page.getByRole("button", { name: /我听懂啦/ }).click();
await page.waitForTimeout(500);
await shot("03-ask");
console.log("shot: 03-ask");

// 输入回答并提交
await page.locator("textarea").fill("我觉得最关键的是先弄清楚数位和计数单位");
await page.getByRole("button", { name: /提交我的回答/ }).click();
await page.waitForTimeout(500);
await shot("04-ask-feedback");
console.log("shot: 04-ask-feedback");
await page.getByRole("button", { name: /继续做小测验/ }).click();
await page.waitForTimeout(500);

// quiz 第 1 题：作答
await shot("05-quiz-q1");
console.log("shot: 05-quiz-q1");
const firstOpt = page.locator(".question-option").first();
await firstOpt.click();
await page.getByRole("button", { name: /提交答案/ }).click();
await page.waitForTimeout(500);
await shot("06-quiz-q1-checked");
console.log("shot: 06-quiz-q1-checked");
await page.getByRole("button", { name: /下一题/ }).click();
await page.waitForTimeout(500);

// quiz 第 2 题
await shot("07-quiz-q2");
console.log("shot: 07-quiz-q2");
const opt2 = page.locator(".question-option").nth(1);
await opt2.click();
await page.getByRole("button", { name: /提交答案/ }).click();
await page.waitForTimeout(400);
// 最后一题 → 看总结
const nextBtn = page.getByRole("button", { name: /看课堂总结/ });
if (await nextBtn.count()) {
  await nextBtn.click();
  await page.waitForTimeout(500);
  await shot("08-done");
  console.log("shot: 08-done");
}

await browser.close();
