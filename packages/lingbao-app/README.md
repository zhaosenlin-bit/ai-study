# 灵宝 AI 伴学 (Lingbao AI Companion)

> 移动端 AI 学习伴侣 · 宠物精灵陪伴 + 自适应学习路径
> PRD: [docs/PRD.md](./docs/PRD.md) | 验收: [docs/ACCEPTANCE-CRITERIA.md](./docs/ACCEPTANCE-CRITERIA.md) | 架构: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 参考: [docs/REFERENCES.md](./docs/REFERENCES.md)

## 🎉 当前状态 (Phase 1 MVP)

- ✅ PRD v1.0 + 验收标准 + 架构设计
- ✅ 知识库 4 个外部仓库已入库 `C:\my\_know\`
- ✅ ChinaTextbook 教材 URL 清单已建(46 个目标 PDF + 6 个拆分组)
- ✅ 移动端 Vue 3 + Capacitor + TypeScript 脚手架(71 模块, 209KB JS gzip 80KB)
- ✅ 宠物精灵"灵宝"4 种状态贴图(用 gpt-image-2 生成)
- ✅ Emotion-Ball 表情引擎(原 emotion-ball 项目,纯 SVG)
- ✅ 8 个页面: Splash / Child / Diagnosis / Home / Explain / Practice / Parent / Settings
- ✅ 玻璃拟态 UI + 深空渐变 + 粒子背景
- ✅ Mock API 模式 + 真实后端双模式
- ✅ 后端 FastAPI 扩展(挂载 ai-study-repo 现有 + 加新路由)
- ✅ Kokoro TTS 接入(zf_xiaoxiao 中文童声)
- ✅ 知识图谱 G3-G9 全覆盖(语文人教/数学北师大/英语人教 PEP)
- ✅ 多孩子档案管理(SQLite 本地存储)

## 🚀 快速启动

```bash
# Terminal 1 — 后端
cd packages/backend-extension
python -m uvicorn lingbao_app.main:app --port 8000
# 后端地址: http://localhost:8000
# Swagger: http://localhost:8000/docs

# Terminal 2 — 移动端(Web 预览)
cd apps/mobile
npm install  # 首次
npm run dev
# 预览: http://localhost:5173
```

## 📂 目录

- `docs/`  PRD / 验收 / 架构 / 参考
- `apps/mobile/`  Capacitor + Vue 3 移动端(可在 Web 预览,可打包 iOS/Android)
- `packages/backend-extension/`  FastAPI 扩展(挂载 ai-study-repo + 新功能)

## 🔑 关键技术选择

| 维度 | 选择 | 原因 |
|---|---|---|
| 移动端框架 | **Capacitor + Vue 3** | 直接复用 emotion-ball 原生 JS,WebView 内零成本集成;Vue 3 + TypeScript 类型安全 |
| 宠物精灵 | **自设计 + emotion-ball 引擎** | 用户要求"更大更活泼";灵宝 4 种状态贴图 + emotion-ball 32 种表情联动 |
| 后端 | **复用 ai-study-repo + 扩展** | 已有三科题库+知识图谱,避免重复造轮;FastAPI + LangGraph |
| AI 模型 | **MiniMax(minimax-key)** | 用户 key.txt 提供;支持中英文 |
| TTS | **Kokoro zf_xiaoxiao** | 开源、儿童音色(zf_xiaoxiao 中女童, 用户指定) |
| 数据存储 | **本地 SQLite(idb-keyval)** | 单机无登录要求,儿童隐私优先 |

## 📊 项目结构

```
lingbao-app/
├── docs/
│   ├── PRD.md                      # 产品需求 v1.0
│   ├── ACCEPTANCE-CRITERIA.md      # 验收标准(5 大类 30+ 项)
│   ├── ARCHITECTURE.md             # 架构设计
│   └── REFERENCES.md               # 6 个 GitHub 对标项目
├── apps/mobile/                    # 移动端
│   ├── src/
│   │   ├── views/                  # 8 个页面
│   │   ├── components/             # PetSprite / GlassCard / ParticleBg
│   │   ├── stores/                 # Pinia: app / child
│   │   ├── lib/                    # api / db / emotion
│   │   └── router/
│   └── public/
│       ├── emotion-ball/           # 原 emotion-ball 5 个 JS
│       ├── lingbao_idle.png       # 灵宝主形象
│       ├── lingbao_thinking.png
│       ├── lingbao_celebrating.png
│       └── lingbao_sleeping.png
└── packages/backend-extension/     # 后端
    └── lingbao_app/
        ├── main.py                # 入口
        └── routers/               # children / plan / learn / tts
```

## 🎯 Phase 路线

- **Phase 1 (MVP, ✅ 完成)** Pet + 单科诊断 + 计划 + 学习闭环
- **Phase 2** 三科全打通,G3-G6 全覆盖,灵宝表情全覆盖
- **Phase 3** G7-G9 初中数据深化 + 教材版本元数据
- **Phase 4** TTS 集成 + 语音输入
- **Phase 5** iOS / Android 打包 + App 商店上架

## ✅ 验收基线

详见 [docs/ACCEPTANCE-CRITERIA.md](./docs/ACCEPTANCE-CRITERIA.md)

- **教学有效性**: 诊断-课程匹配 ≥85%, 30 天保留 ≥65%, AI 讲解准确率 ≥85%
- **技术质量**: 冷启动 ≤3s, P95 TTFB ≤800ms, 崩溃率 ≤0.5%, APK ≤100MB
- **数据安全**: 100% 本地存储, AES 加密, 无第三方追踪, 无广告
- **AI 责任**: 内容过滤 100%, 模型中断兜底 100%
- **业务影响**: 7 日留存 ≥40%, 30 日留存 ≥25%, NPS ≥45