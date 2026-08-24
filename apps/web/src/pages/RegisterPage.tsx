/** 注册页：学生/家长 + 账号/密码/确认密码/验证码（仿登录页样式）。 */
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { AuthRole, CaptchaResponse, UserInfo } from "@contracts";
import { realGetCaptcha, realRegister } from "@/api/auth";
import { getMe } from "@/api/me";
import { useAppStore } from "@/stores/appStore";

const ROLES: { value: AuthRole; label: string }[] = [
  { value: "student", label: "学生" },
  { value: "parent", label: "家长" },
];

export function RegisterPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const initialRole: AuthRole = searchParams.get("role") === "parent" ? "parent" : "student";
  const [role, setRole] = useState<AuthRole>(initialRole);
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
      setCurrentUser({ userId: me.student.student_id, displayName: me.display_name, grade: me.student.grade, role: me.role });
      const target = me.role === "parent" ? "/" : "/setup/grade";
      nav(target, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "注册失败";
      setErrors({ form: message });
      refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(249,18%,95%)]">
      {/* 右侧视频（与登录/Landing 一致） */}
      <div className="absolute right-0 top-0 hidden h-full w-[55%] lg:block">
        <video
          className="h-full w-full rounded-bl-2xl object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_192508_4eecde4c-f835-4f4b-b255-eafd1156da99.mp4"
        />
      </div>

      {/* 左侧注册卡片 */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 lg:px-8">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-2xl bg-white/95 p-7 shadow-xl ring-1 ring-[hsl(240,10%,88%)] backdrop-blur"
        >
          <h2 className="mb-1 text-2xl font-bold text-black">注册 ai-study</h2>
          <p className="mb-5 text-sm text-[hsl(240,5%,46%)]">选择身份，创建属于你的学习账号。</p>

          <div className="mb-4 flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex-1 rounded-lg py-2 transition ${
                  role === r.value ? "bg-[hsl(18,98%,53%)] text-white shadow" : "text-black"
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
                placeholder="请输入验证码（不分大小写）"
                value={captcha}
                onChange={(v) => setCaptcha(v.toLowerCase())}
                error={errors.captcha}
              />
            </div>
            <button
              type="button"
              onClick={refreshCaptcha}
              title="点击刷新"
              className="mt-0 h-11 shrink-0 overflow-hidden rounded-xl border border-[hsl(240,10%,88%)] bg-[hsl(249,18%,95%)]"
            >
              {captchaImg ? <img src={captchaImg} alt="验证码" className="h-11 w-28 object-contain" /> : <span className="block h-11 w-28" />}
            </button>
          </div>

          {errors.form && (
            <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{errors.form}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-gradient-to-b from-[hsl(24,100%,72%)] to-[hsl(18,98%,53%)] py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "注册中..." : "立即注册"}
          </button>

          <div className="mt-4 text-center text-sm text-[hsl(240,5%,46%)]">
            已有账号？
            <Link to="/login" className="ml-1 font-medium text-[hsl(18,98%,53%)] hover:underline">
              立即登录
            </Link>
          </div>
        </form>
      </div>
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
