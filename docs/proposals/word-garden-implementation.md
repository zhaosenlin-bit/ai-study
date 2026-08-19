# 词卡花园（Word Garden）实现方案

版本：v0.1 实现草案
作者：角色 D（胡智博）
关联创意：`docs/proposals/student-proposals/role-D-胡智博-词卡花园.md`
目标读者：角色 A（后端）、角色 E（前端）、总负责人（评审）

## 1. 方案概述

将"错词本"从静态列表升级为**成长花园**：每个错词是一株植物，生长阶段由 SM-2 复习调度数据驱动——连续答对次数越多，植物越长越大，最终开花代表"长期记住"。

核心价值：
- 学生：复习从"补错"变成"养花"，有即时正反馈。
- 评委：把自适应复习调度"画"出来，一眼看懂错题闭环。
- 全组：**零新增接口、零新增数据字段**，完全复用 OpenAPI v0.1 现有契约。

## 2. 核心概念：四阶段状态机

| 阶段 | 英文键 | 触发条件（复用 `review_count`） | 视觉表现 | 语义 |
| --- | --- | --- | --- | --- |
| 种子 | `seed` | 写入错词本时（最近一次答错，count=0） | 棕色种子入土 | 错词进入复习计划 |
| 发芽 | `sprout` | 连续答对 1 次（count=1） | 绿色嫩芽 | 首次复习通过 |
| 长叶 | `leaf` | 连续答对 2 次（count=2） | 两片叶子 | 二次巩固 |
| 开花 | `bloom` | 连续答对 ≥ 3 次（count≥3） | 花朵 + 单词花牌 | 长期记忆达成（间隔封顶 15 天） |

转换规则：
- **答对 1 次 → 阶段 +1**（seed→sprout→leaf→bloom），上限 bloom。
- **任意一次答错 → 重置回 seed**（review_count 归 0，间隔回到 1 天）。
- 增强项（P1）：已开花的错词在花园角落保留一枚"曾经开花"印记，答错重置不消失，保护学生成就感。

## 3. 数据模型（零新增字段）

```text
阶段 = f(review_count)     # 0→seed, 1→sprout, 2→leaf, ≥3→bloom
倒计时 = next_review_at - now   # 前端本地计算展示
```

全部数据来自现有 `MistakeRecord`（OpenAPI v0.1）：

```json
{
  "mistake_id": "mist_0001",
  "question_id": "english_q_0013",
  "subject": "english",
  "error_type": "spelling_error",
  "review_count": 1,          // ← 生长阶段的唯一驱动
  "next_review_at": "2026-08-22T09:00:00+08:00"   // ← 浇水倒计时
}
```

不需要改 `docs/api/openapi-contract-v0.yaml`。若需要"曾经开花"印记，可在 `MistakeRecord` 增加可选字段 `max_review_count`（提交 PR 走契约流程，属可选增强）。

## 4. 接口复用（零新增）

| 现有接口 | 词卡花园用途 |
| --- | --- |
| `GET /api/v1/students/{id}/mistakes` | 花园数据源：拉取全部错词 → 按 review_count 渲染植物状态 |
| `POST /api/v1/review/next` | 今日浇水清单：返回到期复习项（ReviewItem） |
| `POST /api/v1/diagnosis/submit` / `POST /api/v1/agent/chat` | 复习结果回写：角色 A 在此更新 `review_count` 与 `next_review_at`，花园随之变化 |

约定：角色 A 在复习结果回写时更新 `review_count`（答对 +1，答错归 0）并重算 `next_review_at`（SM-2 简化版规则见 `data/question_bank/english/review_schedule.md`）。

## 5. 前端实现（角色 E）

### 5.1 组件结构

```text
WordGardenView            # 花园主视图（背景 + 植物网格 + 状态栏）
├── GardenPlant           # 单个错词植物（4 态切换）
│   ├── SeedSprite        # seed：种子图形
│   ├── SproutSprite      # sprout：嫩芽
│   ├── LeafSprite        # leaf：双叶
│   └── BloomSprite       # bloom：花朵 + 单词花牌
├── ReviewCountdown       # 下次复习倒计时徽章（如"明天 09:00 浇水"）
└── GardenFooter          # 已开花统计 + 花园总览
```

### 5.2 状态 → 视觉映射

```ts
type GrowthStage = "seed" | "sprout" | "leaf" | "bloom";
const stageOf = (reviewCount: number): GrowthStage =>
  reviewCount <= 0 ? "seed" : reviewCount === 1 ? "sprout" : reviewCount === 2 ? "leaf" : "bloom";
```

### 5.3 动画方案（轻量，不引重依赖）

- 阶段推进：`opacity + transform: scale` 过渡（300ms ease）。
- 开花：花瓣 `rotate/scale` 关键帧动画（纯 CSS）。
- 倒计时到期：植物轻微闪烁提示"该浇水了"。
- 降级方案：动画不可用时退回静态卡片 + emoji（🌰→🌱→🌿→🌸），保证任何环境可演示。

### 5.4 数据流

```text
进入错题本页
  → GET /mistakes (stale-while-revalidate)
  → 分组：bloom 花园角落 / 其余按 next_review_at 排序展示
  → 学生点"浇水" → POST /review/next 取题 → 作答
  → 提交结果 → refetch /mistakes → 植物状态更新 + 倒计时刷新
  → AI 精灵按阶段播报（见 §6）
```

离线兜底：后端未就绪时，前端可直读 `tests/fixtures/english/mistake_record.json` 演示（含 seed/sprout 两态样例）。

## 6. Prompt 配合（角色 D）

- `prompts/english/dialogue_partner.md` 增加"浇水"话术规则：
  - 复习答对：`banana 发芽啦！明天记得来浇水。`
  - 连续答对 2 次：`你的 banana 长出第二片叶子了，再浇一次水就开花！`
  - 开花：`开花啦！banana 你已经真正记住了，后面每 15 天浇一次水就够啦。`
- `prompts/english/vocabulary_hint.md` 增加答错回 seed 的鼓励话术：
  - `没关系，种子重新种下，明天浇水又是一株新芽。`

## 7. 演示脚本集成

在 `docs/demo/english-demo-script.md` 第 2 步（错词进入复习计划）扩展：

```text
banna 拼错 → 种子入土（mistake 写入，review_count=0）
  → 前端花园视图：种子卡片 + "明天 09:00 浇水"倒计时
  → 第 2 天复习答对 → 发芽（review_count=1）
  → AI 精灵："banana 发芽啦！"
  → 家长端一句话：今日花园新增 1 株幼苗
```

1 轮演示即可完整展示"错词 → 复习 → 生长"闭环，评委可看到自适应调度在起作用。

## 8. 验收标准

- [ ] 前端可见至少 3 个生长阶段（seed / sprout / bloom）的植物形态。
- [ ] 复习答对后阶段推进、倒计时更新；答错后回退 seed。
- [ ] 无新增接口、无新增必填字段（契约不变）。
- [ ] 离线可用：仅用 `tests/fixtures/english/mistake_record.json` 可演示 2 态变化。
- [ ] AI 精灵在阶段变化时输出对应"浇水"话术（文本即可，语音 mock）。

## 9. 分工与排期

| 角色 | 任务 | 排期建议 |
| --- | --- | --- |
| D | 状态机规则、浇水话术（本文档 + Prompt 补充） | 已完成/1 天内 |
| A | 复习结果回写 `review_count`/`next_review_at`（复用 submit/chat） | 8-22~8-28 |
| E | GardenPlant 3 态组件 + 倒计时 + 数据流 | 8-22~8-28 |
| D+A+E | 联调（三科联调窗口） | 8-29~9-04 |
| E+D | 演示录制接入总脚本 | 9-05~9-08 |

## 10. 风险与降级

| 风险 | 降级方案 |
| --- | --- |
| 动画开发超时 | 静态卡片 + emoji 4 态（🌰🌱🌿🌸），1 天可完成 |
| 后端回写接口未就绪 | 前端用夹具数据模拟状态推进，演示不受阻 |
| 时间不足 | 只保留 seed → bloom 两级；砍掉花园背景、音效、家长端同步、排行榜 |
| 学生连续答对但间隔长，花园"冷" | 花园顶部展示"已开花"荣誉墙，突出完成感 |
