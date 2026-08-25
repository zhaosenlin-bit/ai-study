import { expect, test } from "@playwright/test";

/**
 * 冒烟测试：三科演示主链路（mock 模式，无需后端）
 * 学生首页 → 诊断 → 结果 → 路径 → 对话 → 错题 → 报告
 */
test("完整跑通三科演示闭环", async ({ page }) => {
  // 0. 登录：未登录会被守卫跳到 /login，用演示账号登入
  await page.goto("/");
  await page.getByRole("button", { name: "小明" }).click();

  // 1. 首页：沉浸式学习空间中央舞台（问候 + AI 精灵 + 诊断卡）
  await expect(page.getByText(/你好呀，小明/)).toBeVisible();
  await expect(page.getByText("ai-study")).toBeVisible();
  await expect(page.getByRole("heading", { name: /三科小诊断/ })).toBeVisible();
  await expect(page.getByText(/开始诊断/)).toBeVisible();

  // 2. 诊断：跳到 /diagnosis 起始页 → 发起 → 答题 → 提交
  await page.getByRole("button", { name: /开始诊断/ }).click();
  await expect(page.getByText(/只要 3 分钟/)).toBeVisible();
  await page.getByRole("button", { name: /开始诊断/ }).click();
  await expect(page.getByText("把一个苹果平均分成 4 份")).toBeVisible();

  // 逐题作答（单选用例答案，填空/简答填文本）
  for (let i = 0; i < 9; i++) {
    const choice = page.locator("button.question-option").first();
    const textarea = page.locator("textarea");
    const input = page.locator("input");
    if ((await choice.count()) > 0) {
      await choice.click();
    } else if ((await input.count()) > 0) {
      await input.fill("25");
    } else if ((await textarea.count()) > 0) {
      await textarea.fill("示例回答");
    }
    if (i < 8) {
      await page.getByRole("button", { name: /下一题/ }).click();
    }
  }
  await page.getByRole("button", { name: /提交诊断/ }).click();
  await expect(page.getByText(/诊断完成/)).toBeVisible();

  // 3. 学习路径
  await page.getByRole("button", { name: /查看学习路径/ }).click();
  await expect(page.getByText(/学习路径地图/)).toBeVisible();
  await expect(page.getByText("薄弱").first()).toBeVisible();

  // 4. AI 对话（数学）
  await page.goto("/chat/math");
  await expect(page.getByPlaceholder(/数学/)).toBeVisible();
  await page.getByPlaceholder(/数学/).fill("1/2 对不对？");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(
    page.getByText(/分步引导|鼓励|讲解|复习|反思/).first(),
  ).toBeVisible();

  // 5. 错题本
  await page.goto("/mistakes");
  await expect(page.getByText(/我的错题本/)).toBeVisible();
  await expect(page.getByText(/概念混淆|规则不熟|粗心/).first()).toBeVisible();

  // 6. 家长报告（雷达图渲染）
  await page.goto("/report");
  await expect(page.getByRole("heading", { name: /学习报告/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "下周建议" })).toBeVisible();
});
