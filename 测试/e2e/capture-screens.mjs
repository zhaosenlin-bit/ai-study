/**
 * 演示截图采集：为路演 PPT / 演示视频生成关键页面素材。
 * 用法：先启动 应用/web 开发服务器（5174），再运行本脚本。
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:5174";
const OUT = new URL("../../文档/demo/screenshots/", import.meta.url).pathname.replace(/^\/([A-Za-z]):\//, "$1:/");

const PAGES = [
  ["01-home", "/"],
  ["02-diagnosis", "/diagnosis"],
  ["03-path", "/path"],
  ["04-chat-math", "/chat/math"],
  ["05-mistakes", "/mistakes"],
  ["06-report", "/report"],
  ["07-demo-console", "/demo"],
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const [name, path] of PAGES) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log("captured:", name);
}
await browser.close();
console.log("done →", OUT);
