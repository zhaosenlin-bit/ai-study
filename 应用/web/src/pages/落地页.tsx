/** Landing 落地页：Hero 区直接占满全屏（左侧登录表单，右侧视频，无顶部导航）。 */
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CaptchaResponse, UserInfo } from "@contracts";
import { realGetCaptcha, realLogin } from "@/api/认证";
import { getMe } from "@/api/用户信息";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { useAppStore } from "@/stores/应用状态";

/** Hero 内嵌登录表单（账号/密码/验证码 + 学生/家长 Tab，校验与现有 登录页 一致） */
function HeroLoginForm() {
  const nav = useNavigate();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const [role, setRole] = useState<"student" | "parent">("student");
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

      {/* 学生 / 家长 Tab */}
      <div className="mb-4 flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
        {(["student", "parent"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setRole(v)}
            className={`flex-1 rounded-lg py-2 transition ${
              role === v ? "bg-[hsl(18,98%,53%)] text-white shadow" : "text-[hsl(240,10%,10%)]"
            }`}
          >
            {v === "student" ? "学生" : "家长"}
          </button>
        ))}
      </div>

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
        <Link to={`/register?role=${role}`} className="ml-1 font-medium text-[hsl(18,98%,53%)] hover:underline">
          立即注册（{role === "student" ? "学生" : "家长"}）
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
          className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
        />
      </div>
      {props.error && <div className="mt-1 text-xs text-rose-500">{props.error}</div>}
    </div>
  );
}

/** Hero 区：左侧登录表单 + 右侧视频 */
/** 星空装饰：散布的星点 */
function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() > 0.85 ? 3 : Math.random() > 0.6 ? 2 : 1,
    delay: Math.random() * 5,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.6)] animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {/* 流星 */}
      <span className="absolute top-[18%] right-[22%] h-px w-16 -rotate-12 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[0.5px]" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-b from-[hsl(238,55%,14%)] via-[hsl(245,45%,10%)] to-[hsl(235,50%,6%)] px-6 py-8">
      <StarField />

      {/* 顶部品牌 */}
      <div className="absolute left-6 top-5 z-20 flex items-center gap-2 text-white">
        <span className="text-xl" aria-hidden>🚀</span>
        <span className="font-black tracking-wide">AI 学伴</span>
      </div>

      {/* 中央立绘 + 登录 */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-5">
        {/* AI 伙伴大立绘 */}
        <div className="relative">
          <span className="absolute -inset-10 rounded-full bg-primary/30 blur-3xl" />
          <AI伙伴 size={200} showBubble={false} />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black tracking-wide text-white drop-shadow">AI 学伴 · 让学习更有趣</h1>
          <p className="mt-1 text-sm text-white/70">自适应 · 智能批改 · 错题每日复习</p>
        </div>

        <HeroLoginForm />
      </div>
    </section>
  );
}

/** Landing 页：Hero 区直接顶到页面顶端（无顶部导航条） */
export function 落地页() {
  return (
    <div className="min-h-screen bg-[hsl(238,45%,10%)] font-[Inter,system-ui,sans-serif] text-white">
      <HeroSection />
    </div>
  );
}
