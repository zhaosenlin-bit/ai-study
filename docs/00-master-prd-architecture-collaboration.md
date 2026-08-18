# ai-study 三科自适应伴学 Agent 总 PRD、架构与协作规则

版本：v0.1  
日期：2026-08-18  
仓库：https://github.com/zhaosenlin-bit/ai-study.git  
适用场景：2026-08-18 晚上课堂讨论、五人分工开发、9 月 9 日初赛提交前集成验收。

## 1. 一句话目标

做一个面向小学 3-6 年级语文、数学、英语三科的 AI 学习伙伴。它不是聊天机器人，而是能通过诊断了解学生，基于知识图谱规划学习路径，在解题卡住时用脚手架式提问引导，并在多次学习后形成长期画像和复习计划的自适应伴学 Agent。

## 2. 今晚需要确认的 5 件事

1. AI 伙伴形象名称与性格设定。项目名固定为 `ai-study`。
2. 五位同学的真实姓名与角色 A-E 对应关系。
3. MVP 是否锁定小学 3-6 年级，还是只做 3-4 年级保证稳定。
4. 是否接入讯飞星火或讯飞 ASR/TTS 作为赛事契合亮点；如果账号暂时不稳定，允许用 DeepSeek/Qwen/MiniMax 等兼容模型或 mock 语音做备用。
5. 今晚每位同学提交的创意方案，按“能否服务完整闭环、能否两周内做出来、能否在路演中讲清楚”筛选进入最终版本。

## 3. 赛事评分对齐

| 评分项 | 分值 | 我们必须展示的证据 | 负责人 |
| --- | ---: | --- | --- |
| 智能体架构设计 | 30 | LangGraph/Dify 工作流、工具调用日志、记忆读写、反思节点 | A |
| 自适应策略 | 25 | 知识图谱、掌握度更新、个性化路径变化、错题复习调度 | A+B+C+D |
| 功能完备程度 | 20 | 诊断、推荐、辅导、错题本、复盘报告完整闭环 | 全组 |
| 创新性与体验 | 15 | 三科融合任务、AI 伙伴、徽章激励、路径地图、家长报告 | E |
| 商业价值 | 10 | 小学家庭伴学场景、家长端报告、可扩展到班级/机构 | E+A |

## 4. GitHub 高质量参考项目与借鉴点

以下项目均在 2026-08-18 通过 GitHub 仓库或 README 核查。我们只借鉴架构思想和工程组织，不复制业务代码。

| 参考项目 | 为什么相关 | 本项目借鉴点 |
| --- | --- | --- |
| [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) | 状态化、可持久化 Agent 编排框架 | 用作诊断、规划、辅导、反思的状态机骨架 |
| [Asyaberk/thinkcode](https://github.com/Asyaberk/thinkcode) | LangGraph + FastAPI + React 的学习平台案例，含 Socratic tutor、三级 hint、学习分析 | 借鉴学生答题流、hint 分级、教师/家长分析面板 |
| [Naresh1401/education-tutor-agent](https://github.com/Naresh1401/education-tutor-agent) | 自适应教育 Tutor，含 Socratic 提问、多层概念解释、自适应 quiz、Chroma RAG | 借鉴 Agent 能力拆分和 RAG 题目检索链路 |
| [gsaini/educational-tutor-ai](https://github.com/gsaini/educational-tutor-ai) | 多 Agent 编排、学生掌握图、学习缺口、情绪/教学法适配 | 借鉴 Student Mastery Graph 和教学策略切换 |
| [openedx/openedx-platform](https://github.com/openedx/openedx-platform) | 大型开源 LMS，课程创作与学习交付分层清晰 | 借鉴课程、章节、任务、提交、进度的领域模型 |
| [moodle/moodle](https://github.com/moodle/moodle) | 成熟 LMS，角色、测验、成绩、插件生态完善 | 借鉴学生/家长/教师角色与测验记录思路 |
| [frappe/lms](https://github.com/frappe/lms) | 轻量开源 LMS，课程层级、测验、作业、证书结构清晰 | 借鉴简单易演示的信息架构 |
| [ankitects/anki](https://github.com/ankitects/anki) | 间隔重复记忆软件代表 | 借鉴错题复习、卡片状态、复习到期机制 |
| [open-spaced-repetition/fsrs4anki](https://github.com/open-spaced-repetition/fsrs4anki) 与 [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) | FSRS 记忆调度算法与 TypeScript 实现 | 英语单词和三科错题复习采用 FSRS/SM-2 简化版 |
| [xxinjie21/Smart-Quiz-Tutor](https://github.com/xxinjie21/Smart-Quiz-Tutor) | AI 出题、错题本、SM-2 复习、知识标签图谱 | 借鉴错题标签、复习面板、学习热力图 |
| [skillcoco/skillcoco](https://github.com/skillcoco/skillcoco) | BKT + SM-2 + AI tutor 的本地自适应学习应用 | 借鉴掌握度模型、微课任务和可解释自适应循环 |
| [chroma-core/chroma](https://github.com/chroma-core/chroma) | 轻量向量检索基础设施 | MVP 用 Chroma 做本地 RAG，部署简单 |
| [qdrant/qdrant](https://github.com/qdrant/qdrant) | 更生产级的向量数据库 | 决赛或数据量扩大后替代 Chroma |
| [neo4j/neo4j](https://github.com/neo4j/neo4j) | 图数据库 | 决赛版可迁移到 Neo4j；初赛先用 JSON 图谱 |
| [h5p/h5p-php-library](https://github.com/h5p/h5p-php-library) | 互动学习内容与 LMS 集成接口思路 | 借鉴题型组件规范和内容包元数据 |
| [FlameEducation/FlameEducation](https://github.com/FlameEducation/FlameEducation) | 中文 AI 教育项目，含 LLM、ASR、TTS、知识图谱/思维导图 | 借鉴中文教育 UI、语音互动和知识图谱可视化 |

## 5. 产品定位

### 5.1 目标用户

- 学生：小学 3-6 年级，需要语文、数学、英语学习陪伴和错题复盘。
- 家长：希望看到孩子哪里薄弱、每天学了什么、下一步怎么补。
- 路演评委：希望看到不是套壳聊天，而是真正有 Agent 架构和自适应策略。

### 5.2 核心闭环

```text
学生选择年级和三科目标
  -> 5-8 道跨学科诊断题
  -> 更新学生画像与掌握度
  -> 知识图谱找薄弱点和前置依赖
  -> 生成今日学习路径
  -> AI 伙伴用 Socratic 提问辅导
  -> 错题进入错题本和复习调度
  -> Agent 反思本轮教学是否需要调整
  -> 家长端生成可读报告
```

### 5.3 MVP 必做

1. 学生端：登录/选择年级、三科诊断、今日任务、AI 对话辅导、错题本、进度地图。
2. 家长端：掌握度雷达图、错因统计、建议复习任务。
3. Agent：诊断、路径规划、脚手架辅导、长期记忆、反思总结。
4. 三科模块：每科至少 30 个知识点、30 道题、3 套 Prompt、1 个完整演示流程。
5. 工程：一键启动、OpenAPI 文档、种子数据、演示脚本。

### 5.4 暂不做

- 不做完整商业级账号体系。
- 不做真实支付、班级管理、复杂后台。
- 不追求覆盖小学 1-6 年级全部知识点。
- 不让 AI 直接给答案作为核心卖点。

## 6. 总体架构

```text
apps/web
  学生端、家长端、演示控制台
      |
      | REST / SSE
      v
services/api
  FastAPI 网关、鉴权占位、OpenAPI、统一错误处理
      |
      v
services/agent
  LangGraph Agent 状态机
  diagnose -> update mastery -> plan path -> tutor -> reflect
      |
      +--> subject tools
      |      math / chinese / english
      |
      +--> retrieval tools
      |      knowledge graph JSON + Chroma
      |
      +--> memory tools
             SQLite student profile + mistake book + review schedule
```

## 7. 推荐技术栈

| 层级 | MVP 选择 | 原因 |
| --- | --- | --- |
| 前端 | React + Vite + TypeScript | 已统一 React，角色 E 负责组件化和联调 |
| 后端 | Python FastAPI | OpenAPI 自动生成，适合 Agent/RAG 接入 |
| Agent | LangGraph 优先，Dify 作为可视化备用 | 更容易体现规划、记忆、工具调用 |
| 模型 | 模型网关可配置：讯飞星火、DeepSeek、Qwen、MiniMax 等 | 赛题未写死指定模型；用可插拔模型降低风险，建议保留星火或讯飞语音作为赛事契合亮点 |
| 知识图谱 | JSON 文件先行，Neo4j 决赛增强 | 初赛快，容易 Git 协作和审查 |
| 向量库 | Chroma 本地持久化 | 轻量，Docker 容易跑 |
| 数据库 | SQLite MVP，PostgreSQL 决赛增强 | 演示稳定，降低部署成本 |
| 复习调度 | SM-2 简化版，英语可扩展 FSRS | 错题本和单词复习有科学依据 |
| 部署 | Docker Compose | 评委和老师验收容易复现 |

## 8. 仓库目录约定

```text
apps/web/                         # 角色 E：前端、演示页
services/api/                     # 角色 A：FastAPI 网关和接口
services/agent/                   # 角色 A：LangGraph 工作流
packages/contracts/               # 角色 A/E：共享类型、OpenAPI 生成物
data/knowledge_graph/math/        # 角色 B：数学知识图谱
data/knowledge_graph/chinese/     # 角色 C：语文知识图谱
data/knowledge_graph/english/     # 角色 D：英语知识图谱
data/question_bank/math/          # 角色 B：数学题库
data/question_bank/chinese/       # 角色 C：语文题库
data/question_bank/english/       # 角色 D：英语题库
prompts/math/                     # 角色 B：数学 Prompt
prompts/chinese/                  # 角色 C：语文 Prompt
prompts/english/                  # 角色 D：英语 Prompt
docs/api/                         # 接口契约
docs/roles/                       # 五人执行文档
tests/                            # 单元测试、接口测试、端到端测试
```

## 9. 五人分工总表

| 角色 | 分支 | 负责人替换 | 核心成果 | 验收方式 |
| --- | --- | --- | --- | --- |
| A Agent 后端与接口 | `feature/agent-core` | 待填姓名 | FastAPI、LangGraph、学生画像、路径规划、接口契约 | Swagger 可访问，闭环 API 可跑通 |
| B 数学模块 | `feature/subject-math` | 待填姓名 | 数学知识图谱、题库、错因规则、Prompt | 数学完整演示 1 轮 |
| C 语文模块 | `feature/subject-chinese` | 待填姓名 | 语文知识图谱、古诗/阅读/识字题库、Prompt | 语文完整演示 1 轮 |
| D 英语模块 | `feature/subject-english` | 待填姓名 | 英语词库、听说/单词题库、复习调度、Prompt | 英语完整演示 1 轮 |
| E 前端、联调与演示 | `feature/web-integration-demo` | 待填姓名 | 学生端、家长端、可视化、演示脚本、PPT 素材 | 浏览器完整跑通三科闭环 |

详细任务见：

- [角色 A 文档](roles/01-role-a-agent-backend.md)
- [角色 B 文档](roles/02-role-b-math.md)
- [角色 C 文档](roles/03-role-c-chinese.md)
- [角色 D 文档](roles/04-role-d-english.md)
- [角色 E 文档](roles/05-role-e-frontend-integration.md)

## 10. 统一数据模型

### 10.1 KnowledgePoint

```json
{
  "id": "math_g4_fraction_basic",
  "subject": "math",
  "grade": 4,
  "name": "分数的初步认识",
  "difficulty": 3,
  "prerequisites": ["math_g3_division_meaning"],
  "common_misconceptions": ["把分母相加", "不能理解平均分"],
  "resources": ["res_math_fraction_intro"]
}
```

### 10.2 Question

```json
{
  "id": "math_q_0001",
  "subject": "math",
  "grade": 4,
  "type": "single_choice",
  "knowledge_point_ids": ["math_g4_fraction_basic"],
  "stem": "下面哪个分数表示把一个苹果平均分成 4 份中的 1 份？",
  "options": ["1/2", "1/4", "4/1", "2/4"],
  "answer": "1/4",
  "rubric": "检查学生是否理解分母表示平均分的份数。",
  "difficulty": 2
}
```

### 10.3 StudentProfile

```json
{
  "student_id": "stu_demo_001",
  "name": "小明",
  "grade": 4,
  "mastery": {
    "math_g4_fraction_basic": 0.45,
    "chinese_g4_poem_image": 0.7,
    "english_g4_food_words": 0.6
  },
  "weak_points": ["math_g4_fraction_basic"],
  "emotion_state": "neutral",
  "learning_style": "visual",
  "updated_at": "2026-08-18T20:00:00+08:00"
}
```

## 11. 接口契约

接口以 [OpenAPI 契约草案](api/openapi-contract-v0.yaml) 为准。任何人需要改字段、路径、枚举，必须先提 PR 修改该文件。

核心接口：

- `POST /api/v1/diagnosis/start`
- `POST /api/v1/diagnosis/submit`
- `GET /api/v1/students/{student_id}/profile`
- `GET /api/v1/students/{student_id}/path`
- `POST /api/v1/agent/chat`
- `GET /api/v1/students/{student_id}/mistakes`
- `POST /api/v1/review/next`
- `GET /api/v1/reports/parent/{student_id}`

## 12. 里程碑

今天是 2026-08-18，初赛作品截止为 2026-09-09 24:00。

| 日期 | 目标 | 验收 |
| --- | --- | --- |
| 2026-08-18 晚 | 课堂确认最终版本、角色、项目名、MVP 范围 | 本文档 v0.1 修改为 v1.0 |
| 2026-08-19 至 2026-08-21 | 仓库骨架、接口契约、三科图谱样例、前端线框 | 每个分支至少 1 个 PR |
| 2026-08-22 至 2026-08-28 | Agent 核心、三科题库、前端主要页面 | 能跑通单科诊断到推荐 |
| 2026-08-29 至 2026-09-04 | 三科联调、错题本、复习、家长报告 | 能跑通三科完整闭环 |
| 2026-09-05 至 2026-09-08 | 演示视频、PPT、部署文档、Bug 修复 | 预答辩通过 |
| 2026-09-09 | 最终打包提交 | zip、PPT/PDF、Demo、视频齐全 |

## 13. 每位同学今晚创意方案的接入规则

每个创意方案必须写成 1 页以内，包含：

1. 创意名称。
2. 服务哪个评分点。
3. 对学生有什么实际帮助。
4. 需要改哪些模块。
5. 两周内能否做出可演示版本。

纳入最终版本的优先级：

- P0：能强化“诊断 -> 路径 -> 辅导 -> 复盘”闭环。
- P1：能明显提升路演体验，比如 AI 伙伴、路径地图、徽章、家长报告。
- P2：锦上添花但不影响主闭环，比如皮肤、动画、复杂排行榜。

## 14. 验收总标准

项目最后由老师验收时，必须满足：

1. 从 README 能找到所有文档。
2. `develop` 分支能启动完整 Demo。
3. 三科各有一套真实演示数据，不是空页面。
4. Agent 至少展示一次工具调用、一次画像更新、一次路径变化、一次反思。
5. 前端展示学生端和家长端。
6. PR 记录能看出每位同学独立贡献。
7. 演示视频 3-5 分钟，按“痛点 -> 方案 -> 技术 -> 演示 -> 商业价值”讲清楚。

## 15. 老师需要补充的信息

如果今晚要把文档从 v0.1 定稿为 v1.0，需要补充：

- 五位同学姓名、技术强项、能投入的时间。
- AI 伙伴形象名称。
- 是否已有讯飞星火/ASR/TTS API Key；没有也不阻塞 MVP，可先用 DeepSeek/Qwen/MiniMax 或 mock 语音。
- 是否要求最后把文档转成 Word/PDF。
