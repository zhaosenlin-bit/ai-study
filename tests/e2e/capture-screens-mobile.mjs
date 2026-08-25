/**
 * 移动端截图采集：用于验证 mobile 适配效果
 * 用法：先启动 apps/web 开发服务器（5174），再运行本脚本
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:5174";
const OUT = new URL("../../docs/demo/screenshots-mobile/", import.meta.url).pathname.replace(/^\/([A-Za-z]):\//, "$1:/");
const VIEWPORT = { width: 375, height: 812 }; // iPhone X

const PAGES = [
  ["01-home", "/"],
  ["02-diagnosis", "/diagnosis"],
  ["03-path", "/path"],
  ["04-chat-math", "/chat/math"],
  ["05-mistakes", "/mistakes"],
  ["06-report", "/report"],
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
for (const [name, path] of PAGES) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log("captured:", name);
}
await browser.close();
console.log("done →", OUT);
