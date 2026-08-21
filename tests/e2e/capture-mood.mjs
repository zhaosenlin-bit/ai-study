/**
 * 情绪观察演示截图：发 3 条不同情绪的文本，等 AI 分析+表情切换，截图右侧精灵面板。
 * 用法：先启动 apps/web dev server (5174)，再 node capture-mood.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:5174";
const OUT = new URL("../../docs/demo/screenshots/", import.meta.url).pathname.replace(/^\/([A-Za-z]):\//, "$1:/");

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// 捕获浏览器控制台（观察 moodApi 调用与表情切换）
page.on("console", (msg) => {
  const t = msg.text();
  if (msg.type() === "error" || t.includes("[mood]") || t.includes("[ball]")) {
    console.log("[browser]", msg.type(), t);
  }
});

await page.goto(BASE + "/chat/math", { waitUntil: "networkidle" });
await page.waitForTimeout(800); // 引擎初始化

const CASES = [
  { name: "08-mood-sad", text: "我今天考试考砸了，好难过啊，呜呜", expect: "失落" },
  { name: "09-mood-angry", text: "太气人了！小明比我做得好我却没他分数高，凭什么！", expect: "生气" },
  { name: "10-mood-curious", text: "咦？这个几何题好有趣，我想自己试试看！", expect: "好奇" },
];

const textarea = page.locator("textarea");
const sendBtn = page.getByRole("button", { name: "发送" });

for (const c of CASES) {
  await textarea.fill(c.text);
  await sendBtn.click();
  // 等 mock agent 回复（约几百毫秒） + MiniMax 返回（1~3s） + 表情切换
  await page.waitForTimeout(4500);
  // 滚动到精灵面板并截图整个对话页
  await page.screenshot({ path: `${OUT}${c.name}.png`, fullPage: false });
  console.log("captured:", c.name, "→", c.expect);
}

await browser.close();
console.log("done →", OUT);
