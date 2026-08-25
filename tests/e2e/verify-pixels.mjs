/** 像素级验证：采样关键坐标的颜色，确认天空/太阳/白云真实可见 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";

const BASE = "http://localhost:5174";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

function sample(buf, points) {
  const png = PNG.sync.read(buf);
  const out = {};
  for (const [name, [x, y]] of Object.entries(points)) {
    const i = (y * png.width + x) << 2;
    out[name] = `${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`;
  }
  return out;
}

// ---- 登录页 ----
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const loginShot = await page.screenshot();
console.log("login  :", JSON.stringify(sample(loginShot, {
  天空顶部: [720, 15],
  天空中部: [400, 250],
  太阳: [1275, 30],
  左云: [120, 125],
  右下云: [1320, 770],
  底部暖光: [720, 885],
})));

// ---- 首页（先登录）----
await page.getByRole("button", { name: "小明" }).click();
await page.waitForURL(BASE + "/");
await page.waitForTimeout(800);
const homeShot = await page.screenshot();
console.log("home   :", JSON.stringify(sample(homeShot, {
  天空顶部: [720, 15],
  太阳: [1275, 30],
  云1: [120, 145],
  云2: [980, 285],
  云3: [420, 745],
  底部暖光: [720, 885],
})));

await browser.close();
