# 灵宝 AI 伴学 — 参考项目

> 6 个 GitHub 开源项目 + 行业基线研究。

## 对标项目

| 仓库 | 技术栈 | 我们可借鉴的 |
|---|---|---|
| [shuairongzeng/smartStudy](https://github.com/shuairongzeng/smartStudy) | Flutter + FastAPI + Qwen + CosyVoice 3 / edge-tts + FunASR | Flutter UI 模式、Qwen 接入、CosyVoice 儿童 TTS 选择 |
| [yusukebass77/kids-ai](https://github.com/yusukebass77/kids-ai) | FastAPI + PWA + OpenRouter | **多孩子档案架构**(per-child persona)、content safety gate、PWA 离线 |
| [seanstock/Merlin](https://github.com/seanstock/Merlin) | Kotlin Android + Clean Arch + MVVM + Room + Jetpack Security | **企业级 Android 架构**(app/core/data/domain/ui 模块)、加密本地存储 |
| [masumhasan/kided](https://github.com/masumhasan/kided) | React + TS + Gemini + Vite | Gemini 接入模式、Web Speech API 集成 |
| [Khamel83/kid-friendly-ai](https://github.com/Khamel83/kid-friendly-ai) | Next.js + OpenRouter + Web Speech | 角色化 prompt 设计、内容过滤 |
| [Subroz/kidlearnapp](https://github.com/Subroz/kidlearnapp) | Flutter | 双语教育 app、UI 灵感 |

## 验收基线出处

- **课程完成率 ≥ 70%**:典型 K-12 自适应学习 App 研究
- **30 天知识点保留 ≥ 65%**:学习间隔重复研究 + Khan Academy 内部数据
- **P95 TTFB < 800ms**:移动端 API 网关行业基线(Google SRE book)
- **崩溃率 ≤ 0.5%**:Crashlytics 2025 全球基准
- **NPS ≥ 45**:Duolingo 公开数据
- **次日/7 日/30 日留存**:Khan Academy + Duolingo 公开案例
- **儿童内容过滤**:COPPA + Common Sense Media 框架
- **本地化存储**:来自 yusukebass77/kids-ai 的"privacy-first"理念
- **多孩子档案**:来自 yusukebass77/kids-ai + 家长控制面板研究
- **5 大验收类别**:综合 OpenMAIC、Merlin、kids-ai 的合规清单

## 我们采用的差异化

- **宠物精灵作为情感核心**:参考上述项目,但 emotion-ball + 自设计"灵宝"角色是独家差异化
- **TTS 童声**:Kokoro 的 `zf_xiaoxiao`(小小)vs 对标项目用 CosyVoice
- **完全单机本地化**:vs smartStudy 依赖服务端,vs kids-ai 是 PWA
- **教材版本严格映射**(人教/北师大/PEP):对标项目大多未做版本区分

## 排除项

- 不引入 Crashlytics 等第三方 SDK(数据本地化要求)
- 不做云端账号(单机本地原则)
- 不使用教育 SaaS 平台(如 Khan Academy 接入),自建数据流
