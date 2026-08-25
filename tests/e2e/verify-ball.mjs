/** 定位 AI 伙伴球实际渲染位置 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";

const BASE = "http://localhost:5174";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "小明" }).click();
await page.waitForURL(BASE + "/");
await page.waitForTimeout(1200);

const info = await page.evaluate(() => {
  const ball = document.querySelector("[role='img'][aria-label*='精灵']");
  const host = ball?.parentElement;
  const wrapper = host?.parentElement;
  const bubble = document.querySelector(".glass-panel.animate-pop");
  return {
    wrapperRect: wrapper?.getBoundingClientRect().toJSON(),
    hostRect: host?.getBoundingClientRect().toJSON(),
    ballRect: ball?.getBoundingClientRect().toJSON(),
    bubbleRect: bubble?.getBoundingClientRect().toJSON(),
  };
});
console.log(JSON.stringify(info, null, 2));

const png = PNG.sync.read(await page.screenshot());
const s = (x, y) => { const i = (y * png.width + x) << 2; return `${png.data[i]},${png.data[i+1]},${png.data[i+2]}`; };
if (info.hostRect) {
  const cx = Math.round(info.hostRect.x + info.hostRect.width / 2);
  console.log(`球心(${cx},${Math.round(info.hostRect.y + info.hostRect.height / 2)}):`, s(cx, Math.round(info.hostRect.y + info.hostRect.height / 2)));
  console.log(`球顶 y=${Math.round(info.hostRect.y)}:`, s(cx, Math.max(0, Math.round(info.hostRect.y))));
}
await browser.close();