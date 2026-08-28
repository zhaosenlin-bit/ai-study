import type { DiagnosisItem, DiagnosisReport, Plan } from "./api-types";

// 后端 API client — 默认 mock 模式
const BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:8000";
const USE_MOCK = (import.meta.env.VITE_USE_MOCK as string) !== "false";

async function request<T>(path: string, body?: unknown, mockData?: T): Promise<T> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));
    return mockData as T;
  }
  const res = await fetch(BASE + path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error("API " + path + " " + res.status);
  return res.json() as Promise<T>;
}

function mockDiagnosis(grade: number) {
  const items: DiagnosisItem[] = [
    { id: "m1", subject: "math", grade, difficulty: 1, question: grade + " 年级: 24 × 5 = ?", options: ["100", "110", "120", "130"], correctIndex: 2 },
    { id: "m2", subject: "math", grade, difficulty: 2, question: grade + " 年级: 一个三角形内角和等于?", options: ["90°", "180°", "270°", "360°"], correctIndex: 1 },
    { id: "c1", subject: "chinese", grade, difficulty: 1, question: grade + " 年级: 下面哪个字的拼音是 hǎo?", options: ["号", "好", "浩", "郝"], correctIndex: 1 },
    { id: "e1", subject: "english", grade, difficulty: 1, question: "What color is the sky on a clear day?", options: ["Red", "Blue", "Green", "Yellow"], correctIndex: 1 },
    { id: "m3", subject: "math", grade, difficulty: 3, question: grade + " 年级: 方程 2x + 5 = 17 的解是?", options: ["4", "5", "6", "7"], correctIndex: 2 },
  ];
  return { id: "diag_" + Date.now(), items };
}

function mockReport(answers: { itemId: string; chosenIndex: number }[]): DiagnosisReport {
  const map: Record<string, number> = { m1: 2, m2: 1, c1: 1, e1: 1, m3: 2 };
  let score = 0;
  for (const a of answers) { if (map[a.itemId] === a.chosenIndex) score += 20; }
  const level: DiagnosisReport["overall"]["level"] = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";
  return {
    childId: "mock",
    overall: { level, score },
    perSubject: {
      math: { level: score >= 60 ? "B" : "C", strongTopics: ["乘法"], weakTopics: ["方程"] },
      chinese: { level: "A", strongTopics: ["识字"], weakTopics: [] },
      english: { level: "B", strongTopics: ["颜色"], weakTopics: ["时态"] },
    },
  };
}

function mockPlan(childId: string, grade: number, report: DiagnosisReport): Plan {
  const today = new Date().toISOString().slice(0, 10);
  const encouragement =
    report.overall.level === "A" ? "你太厉害啦!灵宝要跟你学习!" :
    report.overall.level === "B" ? "不错不错~今天我们一起攻克小难题吧!" :
    "没关系~灵宝陪你慢慢来,我们一起加油!";
  return {
    id: "plan_" + Date.now(),
    childId,
    date: today,
    petEncouragement: encouragement,
    tasks: [
      { id: "t1", subject: "math", topic: "乘法复习", type: "explain", duration: 8, done: false },
      { id: "t2", subject: "math", topic: "乘法复习", type: "practice", duration: 6, done: false },
      { id: "t3", subject: "chinese", topic: "识字练习", type: "practice", duration: 6, done: false },
    ],
  };
}

function mockExplain(taskId: string, topic: string, grade: number) {
  return {
    taskId, topic,
    script: "今天我们来学: " + topic + "。先想想," + topic + "在我们生活里很常见哦~比如去超市买 3 袋糖,每袋 5 颗,一共多少颗呢? 对啦,就是 15 颗!这就是乘法的魔力!",
    keyPoints: ["乘法的意义", "乘号 × 的写法", "和加法的关系"],
  };
}

function mockPractice(taskId: string, topic: string, grade: number) {
  return {
    taskId,
    questions: [
      { id: "p1", subject: "math", grade, difficulty: 1, question: "7 × 8 = ?", options: ["54", "56", "64", "72"], correctIndex: 1 },
      { id: "p2", subject: "math", grade, difficulty: 2, question: "12 × 6 = ?", options: ["60", "66", "72", "78"], correctIndex: 2 },
      { id: "p3", subject: "math", grade, difficulty: 2, question: "9 × 9 = ?", options: ["72", "81", "90", "99"], correctIndex: 1 },
    ],
  };
}

function mockAnswer(itemId: string, chosenIndex: number) {
  const correctMap: Record<string, number> = { p1: 1, p2: 2, p3: 1 };
  const correct = correctMap[itemId] === chosenIndex;
  return {
    correct,
    feedback: correct ? "答对啦!你真聪明!" : "没关系~我们再想想,灵宝陪你!",
    petReaction: correct ? 38 : 33,
  };
}

export const api = {
  startDiagnosis: (childId: string, grade: number) =>
    request("/api/diagnosis/start", { childId, grade }, mockDiagnosis(grade)),
  submitDiagnosis: (id: string, grade: number, answers: { itemId: string; chosenIndex: number }[]) =>
    request("/api/diagnosis/submit", { id, grade, answers }, mockReport(answers)),
  generatePlan: (childId: string, grade: number, report: DiagnosisReport) =>
    request("/api/plan/generate", { childId, grade, report }, mockPlan(childId, grade, report)),
  explain: (taskId: string, topic: string, grade: number) =>
    request("/api/learn/explain", { taskId, topic, grade }, mockExplain(taskId, topic, grade)),
  practice: (taskId: string, topic: string, grade: number) =>
    request("/api/learn/practice", { taskId, topic, grade }, mockPractice(taskId, topic, grade)),
  answer: (taskId: string, itemId: string, chosenIndex: number) =>
    request("/api/learn/answer", { taskId, itemId, chosenIndex }, mockAnswer(itemId, chosenIndex)),
};
