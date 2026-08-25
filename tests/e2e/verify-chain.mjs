/** 完整追踪 AI 祖先链 + 检查 SVG 是否有 transform */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:5174";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "小明" }).click();
await page.waitForURL(BASE + "/");
await page.waitForTimeout(1200);

const info = await page.evaluate(() => {
  const ball = document.querySelector("[role='img'][aria-label*='精灵']");
  const chain = [];
  let el = ball;
  while (el && el !== document.body) {
    const cs = getComputedStyle(el);
    chain.push({
      tag: el.tagName + (el.className ? "." + (typeof el.className === "string" ? el.className.slice(0, 40) : "") : ""),
      rect: el.getBoundingClientRect().toJSON(),
      transform: cs.transform,
      position: cs.position,
    });
    el = el.parentElement;
  }
  const svgTransform = ball?.querySelector("svg") ? getComputedStyle(ball.querySelector("svg")).transform : null;
  const main = document.querySelector("main");
  return {
    chain,
    svgTransform,
    mainScrollTop: main?.scrollTop,
    mainRect: main?.getBoundingClientRect().toJSON(),
    bodyScrollY: window.scrollY,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();