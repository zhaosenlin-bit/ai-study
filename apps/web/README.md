# apps/web · ai-study 前端（角色 E）

小学语数英三科自适应伴学 Agent 的前端沉浸式学习空间。

## 快速开始

```bash
cd apps/web
npm install --cache ./.npm-cache   # 本机沙箱环境下缓存放工作区内
npm run dev                        # http://localhost:5174
```

> 端口固定为 **5174**（本机 5173 被其他项目占用），与 `tests/e2e/playwright.config.ts` 保持一致。

## 环境变量

复制 `.env.example` 为 `.env`：

- `VITE_USE_MOCK=true`（默认）：使用内置 mock 数据，无需后端即可跑通全流程。
- `VITE_USE_MOCK=false`：请求真实 FastAPI（角色 A），地址由 `VITE_API_BASE_URL` 指定（默认 `http://localhost:8000`，`/api` 前缀已由 Vite 代理转发）。

## 目录结构

```text
src/
  api/          # API 门面（mock/真实一键切换）+ mock 数据
  components/
    layout/     # 沉浸式布局：顶栏 / 左右边缘导航 / 底部操作区
    companion/  # AI 伙伴精灵（名称与性格在 config/companion.ts 可配置）
    question/   # 题目卡片
    chart/      # ECharts 封装（家长报告雷达图）
    ui/         # 基础组件（shadcn 风格手写版）
  pages/        # 首页 / 诊断 / 对话 / 路径 / 错题本 / 报告 / 演示控制台
  stores/       # Zustand：应用状态（学生/精灵/模型）+ 学习流程状态
  lib/          # cn() 工具、学科元数据
config/companion.ts  # AI 伙伴名称与性格占位（课堂确认后只改这里）
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器（5174） |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run build` | 生产构建（tsc + vite build） |
| `npm run preview` | 预览构建产物 |

## 接口对接约定

- 所有接口按 `docs/api/openapi-contract-v0.yaml` 调用，共享类型在 `packages/contracts/src/types.ts`。
- 字段不够用时：先在群里说明场景 → 提 PR 改 OpenAPI → 等角色 A 确认后再改页面。
