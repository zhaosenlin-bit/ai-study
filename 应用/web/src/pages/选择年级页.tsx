/** 选年级页：仅学生使用；家长误入直接跳回家长看板。 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setMyGrade } from "@/api/用户信息";
import { useAppStore } from "@/stores/应用状态";

const GRADES = [
  { value: 3, label: "三年级", desc: "小学 3 年级" },
  { value: 4, label: "四年级", desc: "小学 4 年级" },
  { value: 5, label: "五年级", desc: "小学 5 年级" },
  { value: 6, label: "六年级", desc: "小学 6 年级" },
];

function Logo() {
  return (
    <div className="flex flex-col items-center gap-1 pt-2 pb-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl shadow-md">
        🤖
      </div>
      <div className="text-lg font-bold tracking-wide text-black">ai-study</div>
    </div>
  );
}

export function 选择年级页() {
  const nav = useNavigate();
  const { studentId, studentName, role, setCurrentUser } = useAppStore();
  const [picked, setPicked] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 家长账号误入选年级页时直接回家长看板
  useEffect(() => {
    if (role === "parent") {
      nav("/", { replace: true });
    }
  }, [role, nav]);

  async function onConfirm() {
    if (!picked) return;
    setSubmitting(true);
    setError(null);
    try {
      const me = await setMyGrade(studentId, picked);
      setCurrentUser({ userId: me.student.student_id, displayName: me.display_name, grade: me.student.grade, role: me.role });
      nav("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "设置失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md rounded-3xl bg-white px-8 pb-8 pt-2 shadow-xl ring-1 ring-slate-200">
        <Logo />
        <h1 className="text-center text-2xl font-semibold text-black mb-2">选择你的年级</h1>
        <p className="text-center text-sm text-black/60 mb-6">
          {studentName ? `你好，${studentName}！` : "你好！"}请选择当前所在年级，之后可以随时修改。
        </p>

        <div className="grid grid-cols-2 gap-3">
          {GRADES.map((g) => {
            const active = picked === g.value;
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => setPicked(g.value)}
                className={`flex flex-col items-start rounded-2xl border-2 px-4 py-3 text-left transition ${
                  active
                    ? "border-blue-600 bg-blue-50 shadow"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className={`text-lg font-bold ${active ? "text-blue-700" : "text-black"}`}>{g.label}</div>
                <div className="text-xs text-black/60">{g.desc}</div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
        )}

        <button
          type="button"
          disabled={!picked || submitting}
          onClick={onConfirm}
          className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "保存中..." : "确认并开始诊断"}
        </button>
      </div>
    </div>
  );
}
