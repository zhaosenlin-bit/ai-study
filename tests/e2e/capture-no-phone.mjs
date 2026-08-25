/**
 * 删除手机登录后的登录页验证：无"手机登录"tab / 账号登录可用 / 演示快速入口可用
 * 用法：先启动 apps/web dev server（5174），再运行本脚本。
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:5174";
const OUT = new URL("../../docs/demo/screenshots/login/", import.meta.url).pathname.replace(/^\/([A-Za-z]):\//, "$1:/");

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("PASS:", msg);
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.waitForTimeout(700);

// 1. 手机登录 tab 已消失
const phoneTab = await page.getByRole("button", { name: "手机登录" }).count();
assert(phoneTab === 0, "登录页不再有「手机登录」tab");

// 2. 不再有验证码/手机号字段
const phoneInput = await page.locator('input[placeholder*="11 位手机号"]').count();
const codeInput = await page.locator('input[placeholder*="6 位验证码"]').count();
assert(phoneInput === 0 && codeInput === 0, "手机号 / 验证码输入框已删除");

// 3. 账号登录表单在
assert(await page.getByPlaceholder("用户名 / 账号").count() === 1, "账号输入框存在（用户名 / 账号）");
assert(await page.getByPlaceholder("请输入密码").count() === 1, "密码输入框存在");

// 4. 演示学生快速入口 + 微信/QQ + 注册仍在
assert(await page.getByRole("button", { name: "小明", exact: true }).count() >= 1, "演示学生快速入口仍在");
assert(await page.getByRole("button", { name: "微信" }).count() === 1, "微信第三方登录仍在");
assert(await page.getByRole("button", { name: "QQ" }).count() === 1, "QQ 第三方登录仍在");
assert(await page.getByRole("button", { name: "立即注册" }).count() === 1, "注册入口仍在");

await page.screenshot({ path: `${OUT}login-no-phone.png` });
console.log("captured: login-no-phone");

// 5. 账号密码登录闭环（预置账号 xiaoming）
await page.getByPlaceholder("用户名 / 账号").fill("xiaoming");
await page.getByPlaceholder("请输入密码").fill("123456");
await page.getByRole("button", { name: "登 录", exact: true }).click();
await page.waitForTimeout(900);
assert(new URL(page.url()).pathname === "/", "账号密码登录成功进入首页");

// 6. 注册模式仍在（清空登录态后再访问 /login）
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.getByRole("button", { name: "立即注册" }).click();
await page.waitForTimeout(400);
assert(await page.getByPlaceholder("孩子怎么称呼？").count() === 1, "注册表单仍可用（昵称输入框存在）");
await page.screenshot({ path: `${OUT}login-register-no-phone.png` });
console.log("captured: login-register-no-phone");

await browser.close();
console.log("\nALL NO-PHONE LOGIN TESTS PASSED");
