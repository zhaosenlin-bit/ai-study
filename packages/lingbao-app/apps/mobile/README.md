# 灵宝 AI 伴学 — 移动端 (Capacitor + Vue 3)

## 启动

```bash
# 1. 安装依赖
npm install

# 2. 开发模式(Web 预览)
npm run dev
# 打开 http://localhost:5173

# 3. 构建 + 添加移动端平台
npm run build
npx cap add android  # 需 Android Studio
npx cap add ios      # 需 macOS + Xcode

# 4. 同步 + 在 IDE 中运行
npx cap sync
npx cap open android  # 打开 Android Studio
npx cap open ios      # 打开 Xcode
```

## 当前状态

- ✅ Vue 3 + TypeScript + Vite 基础脚手架
- ✅ emotion-ball 引擎集成(原生 JS,通过 window.EmotionBall 桥接)
- ✅ Pinia + Vue Router + idb-keyval
- ✅ 8 个页面(Splash / Child / Diagnosis / Home / Explain / Practice / Parent / Settings)
- ✅ 玻璃拟态 UI + 粒子背景 + 深空渐变
- ✅ Mock API 模式(无需后端即可演示完整流程)
- ✅ 多孩子档案(本地存储)
- ⏳ 灵宝角色形象贴图(下一步,用 gpt-image2 生成)
- ⏳ TTS 集成(Kokoro zf_xiaoxiao)
- ⏳ iOS / Android 打包

## 后端连接

```bash
# 启动后端(在 lingbao-app/packages/backend-extension)
python -m uvicorn lingbao_app.main:app --port 8000
```

修改 `.env` 切换模式:
- `VITE_USE_MOCK=true` → 不依赖后端,前端 mock 数据
- `VITE_USE_MOCK=false` → 调用真实后端 http://localhost:8000


## 灵宝角色贴图

灵宝的 4 个状态贴图都由 GPT Image-2 生成,基于 minimaxi/jojo-image API:
- `/lingbao_idle.png` — 待机
- `/lingbao_thinking.png` — 思考/检索
- `/lingbao_celebrating.png` — 庆祝/开心
- `/lingbao_sleeping.png` — 休眠

宠物精灵会自动根据 emotionId 切换贴图(在 `PetSprite.vue` 内映射)。