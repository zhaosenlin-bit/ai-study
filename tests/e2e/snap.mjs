import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 820 }, locale: 'zh-CN' });
const page = await ctx.newPage();
await page.goto(process.argv[2] ?? 'http://127.0.0.1:5174/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: process.argv[3] ?? './snap.png', fullPage: false });
console.log('OK', process.argv[3] ?? './snap.png');
await browser.close();
