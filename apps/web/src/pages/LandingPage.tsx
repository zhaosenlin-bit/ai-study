/** Landing 落地页：Hero 区直接占满全屏（左侧登录表单，右侧视频，无顶部导航）。 */
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CaptchaResponse, UserInfo } from "@contracts";
import { realGetCaptcha, realLogin } from "@/api/auth";
import { getMe } from "@/api/me";
import { useAppStore } from "@/stores/appStore";
import { Button } from "@/components/ui/button";

/** Hero 内嵌登录表单（账号/密码/验证码，校验与现有 LoginPage 一致） */
function HeroLoginForm() {
  const nav = useNavigate();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string; captcha?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const refreshCaptcha = useCallback(async () => {
    try {
      const data: CaptchaResponse = await realGetCaptcha();
      setCaptchaId(data.captcha_id);
      setCaptchaImg(data.image);
      setCaptcha("");
    } catch {
      /* 接口失败先不阻塞渲染 */
    }
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!username.trim()) next.username = "请输入账号";
    if (!password) next.password = "请输入密码";
    if (!captcha.trim()) next.captcha = "请输入验证码";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const user: UserInfo = await realLogin({
        username: username.trim(),
        password,
        captcha_id: captchaId,
        captcha: captcha.trim(),
      });
      localStorage.setItem("ai-study-user", JSON.stringify(user));
      const me = await getMe(user.user_id);
      setCurrentUser({
        userId: me.student.student_id,
        displayName: me.display_name,
        grade: me.student.grade,
        role: me.role,
      });
      const target = me.role === "parent" || me.student.grade > 0 ? "/home" : "/setup/grade";
      nav(target, { replace: true });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "登录失败" });
      refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-2xl bg-white/95 p-7 shadow-xl ring-1 ring-[hsl(240,10%,88%)] backdrop-blur"
    >
      <h2 className="mb-1 text-2xl font-bold text-[hsl(240,10%,10%)]">登录 ai-study</h2>
      <p className="mb-5 text-sm text-[hsl(240,5%,46%)]">输入账号密码，开启自适应学习之旅。</p>

      <Field
        icon="👤"
        placeholder="账号"
        value={username}
        onChange={setUsername}
        error={errors.username}
      />
      <Field
        icon="🔒"
        type="password"
        placeholder="密码"
        value={password}
        onChange={setPassword}
        error={errors.password}
      />
      <div className="mt-3 flex items-start gap-2">
        <div className="flex-1">
          <Field
            icon="🛡"
            placeholder="验证码（不分大小写）"
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
        {submitting ? "登录中..." : "立即登录"}
      </button>

      <div className="mt-4 text-center text-sm text-[hsl(240,5%,46%)]">
        还没有账号？
        <Link to="/register" className="ml-1 font-medium text-[hsl(18,98%,53%)] hover:underline">
          立即注册
        </Link>
      </div>
    </form>
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
          props.error ? "border-rose-400" : "border-[hsl(240,10%,88%)] focus-within:border-[hsl(18,98%,53%)]"
        }`}
      >
        <span className="mr-2 text-[hsl(240,5%,46%)]">{props.icon}</span>
        <input
          type={props.type ?? "text"}
          value={props.value}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
          className="h-11 w-full bg-transparent text-sm text-black outline-none placeholder:text-[hsl(240,5%,46%)]"
        />
      </div>
      {props.error && <div className="mt-1 text-xs text-rose-500">{props.error}</div>}
    </div>
  );
}

/** Hero 区：左侧登录表单 + 右侧视频 */
function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[hsl(249,18%,95%)]">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-6 lg:px-8">
        <HeroLoginForm />
      </div>

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
    </section>
  );
}

/** Landing 页：Hero 区直接顶到页面顶端（无顶部导航条） */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(249,18%,95%)] font-[Inter,system-ui,sans-serif]">
      <HeroSection />
    </div>
  );
}
