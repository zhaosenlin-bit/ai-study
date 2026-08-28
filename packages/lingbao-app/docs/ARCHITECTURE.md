# 灵宝 AI 伴学 — 架构设计 v1.0

## 总览

```
┌────────────────────────────────────────────────────────────┐
│                      移动端 App (Capacitor + Vue 3)          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │ Pet Sprite  │  │ Diagnosis   │  │ Learning Loop        │ │
│  │ (emotion-   │  │ Page        │  │ (Explain/Practice/   │ │
│  │ ball + 灵宝)│  │             │  │  Review)             │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘ │
│         └──────────────┬──────────────────────┘             │
│            ┌───────────┴────────────┐                       │
│            │ Pinia Store + Router   │                       │
│            └────┬─────────────┬──────┘                       │
│       ┌────────┴──┐       ┌──┴─────────┐                    │
│       │ idb-keyval│       │ API client │                    │
│       │ (local DB)│       │ (fetch)    │                    │
│       └────────────┘       └──────┬─────┘                    │
└────────────────────────────────────┼─────────────────────────┘
                                     │ HTTPS
┌────────────────────────────────────┼─────────────────────────┐
│                    后端 FastAPI (复用 ai-study-repo)         │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │ /diagnosis   │  │ /plan          │  │ /learn           │ │
│  │ (LangGraph)  │  │ (LangGraph)    │  │ (LangGraph)      │ │
│  └──────┬───────┘  └────────┬───────┘  └────────┬─────────┘ │
│         └──────────────┬────┴──────────────────┘           │
│            ┌───────────┴─────────────┐                      │
│            │ Model Gateway           │                      │
│            │ (minimax/deepseek/      │                      │
│            │  qwen/spark → mock)     │                      │
│            └────────────┬────────────┘                      │
│  ┌─────────────────┐    │   ┌────────────────────────────┐ │
│  │ Knowledge Graph │    │   │ Question Bank (JSON)       │ │
│  │ (G3-G9 待补)    │    │   │                            │ │
│  └─────────────────┘    │   └────────────────────────────┘ │
│                         │                                 │
│  ┌──────────────────────┴─────────────────────────────┐   │
│  │ TTS (Kokoro zf_xiaoxiao) / ASR (optional)          │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ PostgreSQL (children, plans, progress, answers)    │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## 目录结构

```
lingbao-app/
├── docs/
│   ├── PRD.md
│   ├── ACCEPTANCE-CRITERIA.md
│   ├── ARCHITECTURE.md
│   └── REFERENCES.md
├── apps/
│   ├── mobile/                       # Capacitor + Vue 3
│   │   ├── capacitor.config.ts
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   ├── main.ts
│   │   │   ├── router/
│   │   │   ├── stores/
│   │   │   │   ├── pet.ts
│   │   │   │   ├── child.ts
│   │   │   │   └── plan.ts
│   │   │   ├── views/
│   │   │   │   ├── SplashView.vue
│   │   │   │   ├── ChildSelectView.vue
│   │   │   │   ├── DiagnosisView.vue
│   │   │   │   ├── HomeView.vue
│   │   │   │   ├── ExplainView.vue
│   │   │   │   ├── PracticeView.vue
│   │   │   │   ├── ParentView.vue
│   │   │   │   └── SettingsView.vue
│   │   │   ├── components/
│   │   │   │   ├── PetSprite.vue       # emotion-ball 包装
│   │   │   │   ├── GlassCard.vue
│   │   │   │   ├── ProgressRing.vue
│   │   │   │   └── ...
│   │   │   ├── lib/
│   │   │   │   ├── api.ts              # API client
│   │   │   │   ├── db.ts               # idb-keyval wrapper
│   │   │   │   └── emotion.ts          # emotion-ball bridge
│   │   │   ├── styles/
│   │   │   │   └── global.css
│   │   │   └── assets/
│   │   │       └── pet/                # 灵宝角色贴图
│   │   └── public/
│   │       └── emotion-ball/           # emotion-ball 4 个核心 JS
│   └── ...
├── packages/
│   └── shared/                        # 共享类型
│       ├── types.ts
│       └── api-contract.ts
├── tools/
│   ├── verify_release.py
│   └── gen_chinese_kg.py
└── README.md
```

## 后端(复用 ai-study-repo)

**保留**:`services/api/`、`services/agent/`、`data/knowledge_graph/`、`data/question_bank/`、`tools/gen_*.py`

**新增/扩展**:
- `data/knowledge_graph/chinese/g7.json`, `g8.json`, `g9.json`
- `data/knowledge_graph/math/g7.json`, `g8.json`, `g9.json` (北师大版)
- `data/knowledge_graph/english/g7.json`, `g8.json`, `g9.json`
- `services/api/routes/tts.py`(Kokoro 接入)
- `services/api/routes/children.py`(多孩子档案管理)
- `services/agent/diagnosis_agent.py`(LangGraph,基于 OpenMAIC 思路)
- `services/agent/learning_agent.py`

## 宠物精灵集成关键路径

1. `apps/mobile/public/emotion-ball/` 放入 emotion-ball 的 4 个核心 JS
2. `apps/mobile/src/lib/emotion.ts` 桥接原生 JS 到 Vue:
   ```ts
   import "../public/emotion-ball/js/engine.js";
   import "../public/emotion-ball/js/ball.js";
   import "../public/emotion-ball/js/emotions.js";
   import "../public/emotion-ball/js/rings.js";
   
   export class PetEmotion {
     private ball: any;
     constructor(container: HTMLElement) {
       this.ball = new (window as any).EmotionBall(container, {
         bodyShape: "blob",
         themeColor: "#7e8cff",
       });
     }
     set(emotionId: number) { this.ball.setEmotion(emotionId); }
     destroy() { this.ball.destroy(); }
   }
   ```
3. `components/PetSprite.vue` 包一层 Vue 响应式 prop

## 教材版本元数据

```ts
// packages/shared/textbook-meta.ts
export const TEXTBOOK_VERSIONS = {
  chinese: { version: "统编版(人教)", publisher: "人民教育出版社" },
  math:    { version: "北师大版",     publisher: "北京师范大学出版社" },
  english: { version: "人教版(PEP)",  publisher: "人民教育出版社" },
};
```

## API 契约(扩展 ai-study-repo)

```
POST /api/children              # 创建孩子档案
GET  /api/children              # 列出本地所有孩子
PUT  /api/children/{id}         # 更新(年级/版本切换)
DELETE /api/children/{id}

POST /api/diagnosis/start       # 开始诊断(child_id, subjects[])
POST /api/diagnosis/submit      # 提交答案 → 报告
GET  /api/diagnosis/{id}        # 报告

POST /api/plan/generate         # 基于诊断生成计划
GET  /api/plan/{child_id}/today # 今日任务
POST /api/plan/{id}/task/{task_id}/complete

POST /api/learn/explain         # 讲解请求
POST /api/learn/practice        # 出题
POST /api/learn/answer          # 答题 + 反馈

POST /api/tts/synthesize        # TTS(Kokoro)
```

## 安全与护栏

- 后端:输入白名单、内容过滤(关键词 + LLM-as-judge)
- 前端:讲解显示前客户端二次过滤敏感词
- 模型选择:默认 minimax(国内合规),其他 provider 作为回退
- 所有模型调用记录 token 用量、延迟、错误率(本地日志)
