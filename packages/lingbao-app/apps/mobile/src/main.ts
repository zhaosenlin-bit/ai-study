import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import "./styles/global.css";

// 加载 emotion-ball 引擎(原生 JS,通过 window 全局)
// 注意: 正确的依赖顺序是 rings → emotions → ball → engine
// 任何调整都会破坏 EXPRESSIONS 引用
import "../public/emotion-ball/rings.js";
import "../public/emotion-ball/emotions.js";
import "../public/emotion-ball/ball.js";
import "../public/emotion-ball/engine.js";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
