/** 注册页：学生/家长 + 账号/密码/确认密码/验证码（仿登录页样式）。 */
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AuthRole, CaptchaResponse, UserInfo } from "@contracts";
import { realGetCaptcha, realRegister } from "@/api/auth";
import { getMe } from "@/api/me";
import { useAppStore } from "@/stores/appStore";

const ROLES: { value: AuthRole; label: string }[] = [
  { value: "student", label: "学生" },
  { value: "parent", label: "家长" },
];

function Logo() {
  return (
    <div className="flex flex-col items-center gap-1 pt-2 pb-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl shadow-md">
        🤖
      </div>
      <div className="text-lg font-bold tracking-wide text-black">ai-study</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-black">Adaptive Tutor</div>
    </div>
  );
}

export function RegisterPage() {
  const nav = useNavigate();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const [role, setRole] = useState<AuthRole>("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const refreshCaptcha = useCallback(async () => {
    const data: CaptchaResponse = await realGetCaptcha();
    setCaptchaId(data.captcha_id);
    setCaptchaImg(data.image);
    setCaptcha("");
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!username.trim()) next.username = "请输入账号";
    else if (username.trim().length < 3) next.username = "账号至少 3 个字符";
    if (!password) next.password = "请输入密码";
    else if (password.length < 6) next.password = "密码至少 6 个字符";
    if (password && password !== confirm) next.confirm = "两次密码不一致";
    if (!captcha.trim()) next.captcha = "请输入验证码";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const user: UserInfo = await realRegister({
        username: username.trim(),
        password,
        role,
        captcha_id: captchaId,
        captcha: captcha.trim(),
      });
      localStorage.setItem("ai-study-user", JSON.stringify(user));
      const me = await getMe(user.user_id);
      setCurrentUser({ userId: me.student.student_id, displayName: me.display_name, grade: me.student.grade });
      nav("/setup/grade", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "注册失败";
      setErrors({ form: message });
      refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center px-4 py-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl bg-white px-8 pb-8 pt-2 shadow-xl ring-1 ring-slate-200"
      >
        <Logo />
        <h1 className="text-center text-2xl font-semibold text-black mb-6">
          注册 <span className="text-black">ai-study</span> 账号
        </h1>

        <div className="mb-5 flex rounded-xl bg-slate-200 p-1 text-sm font-medium">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`flex-1 rounded-lg py-2 transition ${
                role === r.value ? "bg-blue-600 text-white shadow" : "text-black"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <Field icon="👤" placeholder="请输入账号（≥3 字符）" value={username} onChange={setUsername} error={errors.username} />
        <Field icon="🔒" type="password" placeholder="请输入密码（≥6 字符）" value={password} onChange={setPassword} error={errors.password} />
        <Field icon="🔐" type="password" placeholder="请再次输入密码" value={confirm} onChange={setConfirm} error={errors.confirm} />
        <div className="mt-3 flex items-start gap-2">
          <div className="flex-1">
            <Field
              icon="🛡"
              placeholder="请输入验证码"
              value={captcha}
              onChange={(v) => setCaptcha(v.toLowerCase())}
              error={errors.captcha}
            />
          </div>
          <button
            type="button"
            onClick={refreshCaptcha}
            title="点击刷新"
            className="mt-0 h-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
          >
            {captchaImg ? <img src={captchaImg} alt="验证码" className="h-12 w-28 object-contain" /> : <span className="block h-12 w-28" />}
          </button>
        </div>

        {errors.form && (
          <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{errors.form}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "注册中..." : "立即注册"}
        </button>

        <div className="mt-4 text-center text-sm text-black">
          已有账号？
          <Link to="/login" className="ml-1 font-medium text-black hover:underline">
            立即登录
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field(props: {
  icon: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="mt-3">
      <div
        className={`flex items-center rounded-xl border bg-white px-3 transition-colors ${
          props.error ? "border-rose-400" : "border-slate-200 focus-within:border-blue-400"
        }`}
      >
        <span className="mr-2 text-black">{props.icon}</span>
        <input
          type={props.type ?? "text"}
          value={props.value}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
          className="h-11 w-full bg-transparent text-sm text-black outline-none placeholder:text-slate-500"
        />
      </div>
      {props.error && <div className="mt-1 text-xs text-rose-500">{props.error}</div>}
    </div>
  );
}
