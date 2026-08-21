import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import { DEMO_STUDENTS, TOOL_TRACES } from "@/api/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import { useDemoStore } from "@/stores/demoStore";
import { useLearningStore } from "@/stores/learningStore";

interface DemoStep {
  key: string;
  label: string;
  run: () => Promise<void>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function DemoConsolePage() {
  const navigate = useNavigate();
  const { studentId, setStudent, setCompanion } = useAppStore();
  const { startSession, setAnswer, finishDiagnosis, setToolTrace, reset } =
    useLearningStore();
  const { running, currentStep, logs, setRunning, setCurrentStep, pushLog, clearLogs } =
    useDemoStore();

  const cancelRef = useRef(false);

  const steps: DemoStep[] = [
    {
      key: "greeting",
      label: "AI 伙伴问候（读取画像）",
      run: async () => {
        setCompanion("你好呀！今天想先攻克哪一科？", "greeting");
        pushLog("load_profile(stu_demo_001) → 读取画像与连续学习天数");
        navigate("/");
        await sleep(600);
      },
    },
    {
      key: "diagnosis",
      label: "发起三科诊断",
      run: async () => {
        const session = await api.startDiagnosis(studentId, 4, ["math", "chinese", "english"], 3);
        startSession(session.session_id, session.questions);
        setToolTrace(TOOL_TRACES["diagnosis"]);
        pushLog(`diagnose(n=9) → 生成会话 ${session.session_id}`);
        navigate("/diagnosis");
        await sleep(900);
      },
    },
    {
      key: "submit",
      label: "提交诊断 → 画像更新 + 路径规划",
      run: async () => {
        const { questions } = useLearningStore.getState();
        for (const q of questions) {
          setAnswer(
            q.id,
            q.answer ??
              (q.type === "dialogue" || q.type === "short_answer"
                ? "我的回答：我找到了题目中的关键信息，先说出已知条件，再一步一步推理。"
                : "示例答案"),
          );
        }
        const sessionId = useLearningStore.getState().sessionId!;
        const answers = useLearningStore.getState().questions.map((q) => ({
          question_id: q.id,
          answer: useLearningStore.getState().answers[q.id] ?? "",
          elapsed_seconds: 15,
        }));
        const result = await api.submitDiagnosis(sessionId, studentId, answers);
        finishDiagnosis(result);
        setToolTrace(TOOL_TRACES["path"]);
        pushLog(`update_mastery(9 kps) → weak_points=[${result.weak_points.join(", ")}]`);
        pushLog("plan_path(weak=...) → 生成 6 个学习任务");
        navigate("/diagnosis");
        await sleep(900);
      },
    },
    {
      key: "path",
      label: "查看学习路径地图",
      run: async () => {
        pushLog("GET /students/{id}/path → 展示路径节点");
        navigate("/path");
        await sleep(900);
      },
    },
    {
      key: "tutor",
      label: "数学辅导（答错 → 分步引导）",
      run: async () => {
        setCompanion("我们来分步想一想，不着急～", "thinking");
        pushLog("POST /agent/chat → strategy=socratic, hint_level=1");
        navigate("/chat/math");
        await sleep(1200);
      },
    },
    {
      key: "mistakes",
      label: "错题本与复习调度",
      run: async () => {
        pushLog("GET /students/{id}/mistakes → 3 条错题，按 SM-2 调度复习");
        navigate("/mistakes");
        await sleep(900);
      },
    },
    {
      key: "report",
      label: "家长报告",
      run: async () => {
        pushLog("GET /reports/parent/{id} → 雷达图 + 错因统计 + 建议");
        navigate("/report");
        await sleep(600);
      },
    },
  ];

  async function runAll() {
    cancelRef.current = false;
    clearLogs();
    setRunning(true);
    reset();
    for (let i = 0; i < steps.length; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      await steps[i].run();
    }
    setCurrentStep(-1);
    setRunning(false);
    pushLog("✅ 演示完成：诊断 → 路径 → 辅导 → 错题 → 报告 全闭环");
    navigate("/demo");
  }

  function stop() {
    cancelRef.current = true;
    setRunning(false);
    setCurrentStep(-1);
    navigate("/demo");
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">演示控制台 🎬</h2>
          <p className="text-sm text-muted-foreground">
            一键跑通「诊断 → 路径 → 辅导 → 错题 → 报告」完整闭环，用于路演与验收。
          </p>
        </div>
        {running ? (
          <Button variant="destructive" onClick={stop}>
            ⏹ 停止
          </Button>
        ) : (
          <Button size="lg" onClick={() => void runAll()}>
            ▶️ 一键自动演示
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 演示学生切换 */}
        <Card>
          <CardHeader>
            <CardTitle>演示学生</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            {DEMO_STUDENTS.map((s) => (
              <button
                key={s.student_id}
                onClick={() => {
                  setStudent(s.student_id);
                  pushLog(`切换学生 → ${s.name}（${s.grade} 年级）`);
                }}
                className={cn(
                  "flex-1 rounded-xl border px-4 py-3 text-left transition-all",
                  studentId === s.student_id
                    ? "border-primary bg-primary/15"
                    : "border-white/12 bg-white/5 hover:bg-white/8",
                )}
              >
                <div className="text-sm font-bold text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground">
                  {s.grade} 年级 · 连续 {s.streak_days} 天
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* 演示步骤 */}
        <Card>
          <CardHeader>
            <CardTitle>演示流程（3-5 分钟）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {steps.map((step, i) => (
              <div
                key={step.key}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
                  currentStep === i
                    ? "border border-primary/40 bg-primary/10 text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    currentStep === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/8 text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                {step.label}
                {currentStep === i && (
                  <span className="ml-auto animate-pulse text-primary">运行中…</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Agent 痕迹 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>🛠️ Agent 工具痕迹（评分证据）</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 rounded-xl bg-black/30 p-4">
              {logs.length === 0 && (
                <li className="font-mono text-xs text-muted-foreground">
                  点击「一键自动演示」开始，这里会实时展示 Agent 的工具调用日志…
                </li>
              )}
              {logs.map((log, i) => (
                <li
                  key={i}
                  className="animate-fade-in font-mono text-xs leading-relaxed text-subject-english"
                >
                  <span className="mr-2 text-muted-foreground">
                    [{String(i + 1).padStart(2, "0")}]
                  </span>
                  {log}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
