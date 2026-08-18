# 技术栈与架构学习选择指南

版本：v0.3  
用途：给学生建立技术判断力，也给 AI 在后续开发时选择合适技术栈做参考。  
写法：费曼学习法。先用大白话讲清楚，再看真实项目，再做选择判断。  
推荐配合查看：VibeHub https://vibe-hub.org/

## 1. 先理解什么叫技术栈

技术栈不是一堆很酷的名字。

技术栈就是：为了做一个应用，我们从前到后要用哪些工具。

可以把一个应用想成一家餐厅：

| 应用部分 | 餐厅类比 | 技术例子 |
| --- | --- | --- |
| 前端 | 客人看到的大厅和菜单 | React、Vue、Next.js |
| 后端 | 厨房和服务流程 | FastAPI、Node.js、Django |
| 数据库 | 仓库和账本 | SQLite、PostgreSQL、Supabase |
| AI 模型 | 专家厨师 | DeepSeek、Qwen、MiniMax、星火 |
| Agent 框架 | 餐厅经理 | LangGraph、Dify、AutoGen |
| 向量数据库 | 会按意思找资料的资料室 | Chroma、Qdrant、Milvus |
| 部署 | 把餐厅开到街上 | Docker、Vercel、云服务器 |
| App 封装 | 把网页变成手机/电脑应用 | PWA、Tauri、Capacitor |

如果学生只记住名字，不知道每个工具解决什么问题，就很容易被技术名词带着走。

## 2. 选择技术栈的 5 个问题

每次开始项目，都先问这 5 个问题。

1. 这个应用主要给谁用？
2. 第一版必须演示什么？
3. 团队成员最熟什么？
4. 哪些地方以后要升级？
5. 哪些技术会让我们第一版做不出来？

好的技术栈不是最复杂的，而是最适合当前目标的。

## 3. 学生最常见误区

| 误区 | 为什么危险 | 正确想法 |
| --- | --- | --- |
| 什么火用什么 | 项目会变成技术拼盘 | 先看需求，再选工具 |
| 一开始就上大数据库 | 学习成本高，联调慢 | MVP 先简单，后续可升级 |
| 前端等后端做完 | 时间被浪费 | 前端先用 mock 数据 |
| AI 能写代码就不学架构 | AI 会乱选技术 | 人要会判断，AI 才好执行 |
| 只看 UI 不看数据流 | 演示像空壳 | UI 要连到真实闭环 |

## 4. 前端技术怎么选

前端解决的问题是：用户看到什么、怎么点、怎么反馈。

### 4.1 常见选择

| 技术 | 大白话解释 | 适合什么 |
| --- | --- | --- |
| React | 用组件搭界面，生态最大 | AI 应用、复杂交互、团队协作 |
| Vue | 写法直观，上手舒服 | 后台系统、国内团队、简单业务 |
| Next.js | React 加全栈能力 | 正式网站、登录、SEO、服务端渲染 |
| Vite | 快速启动前端项目 | MVP、比赛 Demo、学习项目 |
| Tailwind CSS | 用工具类快速写样式 | 快速统一设计风格 |
| shadcn/ui | 可复制修改的高质量组件 | 做高级感界面，适合 React |
| assistant-ui | React AI 对话组件库 | AI 助手、流式对话、工具调用 UI |
| CopilotKit | 前端 Agent 和生成式 UI | 复杂 AI 交互、应用内助手 |

### 4.2 高质量参考项目

| 项目 | 地址 | 可以学什么 | 选择理由 |
| --- | --- | --- | --- |
| Open WebUI | https://github.com/open-webui/open-webui | AI 聊天应用的信息架构、模型接入、用户体验 | 大型 AI 界面项目，适合看成熟 AI 产品怎么组织功能 |
| LobeHub | https://github.com/lobehub/lobehub | Agent/AI 助手产品体验、角色管理、现代 UI | 适合学习 AI 助手产品的专业感 |
| NextChat | https://github.com/ChatGPTNextWeb/NextChat | 轻量 AI 助手、多端适配 | 适合学习“轻而快”的 AI 应用 |
| Vercel Chatbot | https://github.com/vercel/chatbot | AI 聊天流、Next.js 工程结构 | 适合学习现代 AI Web App 模板 |
| assistant-ui | https://github.com/assistant-ui/assistant-ui | React AI 对话组件 | 适合学习如何做流式对话和消息组件 |
| shadcn/ui | https://github.com/shadcn-ui/ui | 高质量 React 组件和可访问性 | 适合快速做出统一、专业的界面 |
| CopilotKit | https://github.com/CopilotKit/CopilotKit | 应用内 AI 助手、生成式 UI | 适合学习更高级的前端 Agent 体验 |

### 4.3 费曼判断

如果你能向同学解释：“我选 React 是因为这个项目有复杂交互、AI 对话、后续 App 封装生态，而不是因为 React 火”，你就真的理解了选择原因。

## 5. 后端技术怎么选

后端解决的问题是：前端点了按钮以后，系统在哪里处理逻辑、读写数据、调用 AI。

| 技术 | 大白话解释 | 适合什么 |
| --- | --- | --- |
| FastAPI | Python 后端框架，写接口很快 | AI 项目、比赛 Demo、RAG/Agent |
| Node.js / Express | JavaScript 后端 | 前后端都用 JS 的团队 |
| NestJS | 更工程化的 Node 后端 | 大项目、多人协作 |
| Django | 功能很全的 Python Web 框架 | 管理后台、账号权限、传统 Web |
| Flask | 极简 Python Web 框架 | 小接口、教学 demo |

参考项目：

| 项目 | 地址 | 可以学什么 |
| --- | --- | --- |
| FastAPI | https://github.com/fastapi/fastapi | API 设计、自动文档、Python 后端基础 |
| Full Stack FastAPI Template | https://github.com/fastapi/full-stack-fastapi-template | React + FastAPI + PostgreSQL + Docker 的完整工程结构 |
| pytest | https://github.com/pytest-dev/pytest | Python 测试怎么写 |

## 6. Agent 框架怎么选

普通聊天是：用户问一句，模型回一句。  
Agent 是：系统有目标、有状态、会调用工具、会记忆、会根据结果决定下一步。

| 技术 | 大白话解释 | 适合什么 |
| --- | --- | --- |
| LangGraph | 把 Agent 做成流程图/状态机 | 需要讲清楚诊断、规划、反思的项目 |
| Dify | 可视化搭 AI 工作流 | 快速原型、非程序员也能参与 |
| LangChain | 很多 LLM 工具组件 | RAG、工具调用、模型接入 |
| LlamaIndex | 文档检索和知识库强 | 文档问答、OCR、知识库 |
| AutoGen | 多 Agent 协作 | 多角色 AI 讨论、研究型项目 |
| CrewAI | 角色型 Agent 编排 | 多 AI 角色分工任务 |

参考项目：

| 项目 | 地址 | 可以学什么 |
| --- | --- | --- |
| LangGraph | https://github.com/langchain-ai/langgraph | 状态化 Agent、记忆、工具调用 |
| Dify | https://github.com/langgenius/dify | 可视化工作流、RAG、模型和工具集成 |
| LangChain | https://github.com/langchain-ai/langchain | LLM 应用基础组件 |
| LlamaIndex | https://github.com/run-llama/llama_index | 文档检索、知识库、RAG |
| AutoGen | https://github.com/microsoft/autogen | 多 Agent 编排思想 |
| CrewAI | https://github.com/crewAIInc/crewAI | 角色型 Agent 工作流 |

## 7. 数据库怎么选

数据库就是应用的记忆。但不同记忆适合不同容器。

| 数据类型 | 像什么 | 适合技术 |
| --- | --- | --- |
| 用户、订单、错题记录 | 表格账本 | SQLite、PostgreSQL |
| 文件、图片、音频 | 文件柜 | 本地文件、S3、Supabase Storage |
| 教材片段、讲解资料 | 按意思搜索的资料室 | Chroma、Qdrant、Milvus |
| 知识点前后关系 | 知识地图 | JSON、Neo4j |
| 登录和权限 | 门禁系统 | Supabase Auth、自建 JWT |

常见选择：

| 技术 | 大白话解释 | 适合什么 |
| --- | --- | --- |
| SQLite | 一个本地数据库文件 | MVP、本地 Demo、单机项目 |
| PostgreSQL | 成熟强大的关系型数据库 | 正式项目、多人数据 |
| Supabase | 带云数据库、登录、存储的开发平台 | 快速做 Web/移动应用后端 |
| Chroma | 轻量向量库 | 本地 RAG Demo |
| Qdrant | 更工程化的向量数据库 | 生产级向量检索 |
| Milvus | 大规模向量数据库 | 数据很多、性能要求高 |
| Neo4j | 图数据库 | 知识图谱、关系推理 |

参考项目：

| 项目 | 地址 | 可以学什么 |
| --- | --- | --- |
| Supabase | https://github.com/supabase/supabase | Postgres、Auth、Storage 一体化 |
| Chroma | https://github.com/chroma-core/chroma | AI 应用里的向量检索 |
| Qdrant | https://github.com/qdrant/qdrant | 高性能向量数据库 |
| Milvus | https://github.com/milvus-io/milvus | 大规模向量检索架构 |
| Neo4j | https://github.com/neo4j/neo4j | 图数据库和知识图谱 |

## 8. App 封装怎么选

Web 做完以后，怎么变成 App？

| 路线 | 大白话解释 | 适合什么 |
| --- | --- | --- |
| PWA | 网页加一点能力，像 App 一样安装 | 最快、最轻、MVP 后可做 |
| Tauri | 用 Web 前端封装桌面 App，体积小 | Windows/Mac 桌面端 |
| Electron | 桌面 App 老牌方案，生态大 | 功能复杂、团队熟 JS |
| Capacitor | 把 Web 应用封装成移动 App | iOS/Android |
| Expo | React Native 生态，做原生移动 App | 手机体验要求更高 |

参考项目：

| 项目 | 地址 | 可以学什么 |
| --- | --- | --- |
| Tauri | https://github.com/tauri-apps/tauri | 小体积桌面 App 封装 |
| Electron | https://github.com/electron/electron | 成熟桌面 App 架构 |
| Capacitor | https://github.com/ionic-team/capacitor | Web 到移动 App |
| Expo | https://github.com/expo/expo | React Native 移动应用 |
| NextChat | https://github.com/ChatGPTNextWeb/NextChat | AI 应用多端形态 |

## 9. 教育应用要特别学什么

教育项目不是普通工具。它要证明学生真的学会了。

参考项目：

| 项目 | 地址 | 可以学什么 |
| --- | --- | --- |
| Open edX | https://github.com/openedx/openedx-platform | 大型学习平台的课程、学习、内容管理 |
| Moodle | https://github.com/moodle/moodle | 测验、角色、课程管理 |
| Frappe LMS | https://github.com/frappe/lms | 简洁课程结构、测验和学习系统 |
| Anki | https://github.com/ankitects/anki | 间隔重复复习 |
| ts-fsrs | https://github.com/open-spaced-repetition/ts-fsrs | FSRS 复习调度算法 |
| FSRS4Anki | https://github.com/open-spaced-repetition/fsrs4anki | 现代记忆调度思想 |
| Smart Quiz Tutor | https://github.com/xxinjie21/Smart-Quiz-Tutor | AI 出题、错题本、SM-2 复习 |
| ThinkCode | https://github.com/Asyaberk/thinkcode | AI tutor、学习分析、Socratic 提示 |
| education-tutor-agent | https://github.com/Naresh1401/education-tutor-agent | 自适应 Tutor、学习路径、RAG、FastAPI |
| SkillCoco | https://github.com/skillcoco/skillcoco | BKT、SM-2、AI tutor、自适应学习循环 |

教育类项目要重点看：

- 学生画像怎么更新。
- 题目怎么标知识点。
- 错题怎么分类。
- 复习时间怎么安排。
- 家长/教师怎么看报告。

## 10. 测试和质量怎么选

学生项目也需要测试。测试不是为了麻烦，而是为了最后合并时不崩。

| 工具 | 用途 |
| --- | --- |
| pytest | Python 后端和 Agent 单元测试 |
| Playwright | 前端端到端测试，模拟用户点击 |
| OpenAPI | 确保前后端字段一致 |
| Docker Compose | 一键启动多个服务 |

参考项目：

- Playwright：https://github.com/microsoft/playwright
- pytest：https://github.com/pytest-dev/pytest

## 11. 一个通用选择公式

以后任何项目都可以按这个公式选：

```text
用户是谁
  -> 第一版必须演示什么
  -> 哪个技术最容易跑通
  -> 哪个位置以后需要升级
  -> 先选简单可运行方案
  -> 预留升级接口
```

例如：

如果是 AI 学习 App，第一版要演示 AI 辅导和错题复习。  
所以前端选 React，后端选 FastAPI，Agent 选 LangGraph，数据库先 SQLite，知识图谱先 JSON。  
等后面要多人使用，再升级 PostgreSQL/Supabase；等知识点关系复杂，再升级 Neo4j。

## 12. 给 AI 的技术选择提示模板

以后让 AI 帮你选技术栈时，不要只说“帮我选技术栈”。要这样问：

```text
我要做一个 ______ 应用。
目标用户是 ______。
MVP 必须演示 ______。
团队技术水平是 ______。
预计开发时间是 ______。
需要考虑后续升级到 ______。
请给我 2-3 套技术栈，并说明每套的优点、风险、适用场景和最终推荐。
```

这样 AI 才会按需求选，而不是随便堆流行技术。

## 13. 给学生的判断练习

### 练习 1

一个只给老师演示的本地 AI Demo，要不要一开始就上 Kubernetes？

答案：不要。Kubernetes 是部署很多服务的大工具，MVP 会增加复杂度。

### 练习 2

一个需要学生错题长期保存的应用，只用前端 localStorage 可以吗？

答案：不适合。localStorage 容易丢，也不方便家长端查看。MVP 至少用 SQLite，正式版用 PostgreSQL。

### 练习 3

一个 AI 学习应用，只有聊天框，没有题库、画像、路径、错题本，可以参加自适应学习比赛吗？

答案：很危险。它更像聊天套壳，缺少自适应证据。

### 练习 4

为什么先用 JSON 做知识图谱？

答案：因为学生能直接写和检查，Git 能看出变化，第一版更容易跑通。后面关系复杂再升级 Neo4j。

## 14. VibeHub 怎么用

VibeHub 可以作为课后查概念的网站。学生遇到前端、后端、Git、设计、技术栈、AI 开发这些词时，可以先去看大方向，再回来看项目文档。

建议用法：

1. 先在本指南里找到你要理解的技术类别。
2. 去 VibeHub 查相关概念。
3. 再打开对应 GitHub 经典项目，看真实项目怎么组织。
4. 最后回到自己的项目，判断哪些要用，哪些暂时不用。

记住：看案例不是为了复制，而是为了理解专业项目为什么这样组织。

## 15. `ai-study` 为什么选这套

这份项目不是普通网站，而是一个要讲清楚“诊断 -> 路径 -> 辅导 -> 复盘”的 AI 学习 App，所以技术选择要同时满足 4 个条件：

1. 学生能写出来，不要一开始就太复杂。
2. 老师能讲明白，评委能看懂。
3. 以后能升级，不会一开始就堵死。
4. 前端要有沉浸式学习体验，后端要能证明 AI 真的会“思考”和“记忆”。

所以我们选：

- `React + Vite + TypeScript`：前端交互多，AI 对话和 App 化都方便。
- `FastAPI`：接口清楚，文档自动生成，适合 AI 项目。
- `LangGraph`：能把 Agent 的诊断、规划、辅导、反思讲成流程图。
- `SQLite + JSON + Chroma`：第一版先跑通，学生容易理解，后面再升级 PostgreSQL、Neo4j、Qdrant。
- `PWA -> Tauri / Capacitor`：先做 Web，后面再封装 App，不把第一版压垮。

这个选择不是“追最潮”，而是“先把项目做成，再慢慢变专业”。

## 16. 总结

会写代码很重要，但会判断技术栈更重要。

真正的开发不是“我会 React”或“我会 Python”，而是：

- 我知道这个需求要解决什么问题。
- 我知道哪些技术适合第一版。
- 我知道哪些技术以后再升级。
- 我能向别人解释为什么这么选。

这就是学生从“跟着 AI 写代码”走向“指挥 AI 做项目”的关键。
