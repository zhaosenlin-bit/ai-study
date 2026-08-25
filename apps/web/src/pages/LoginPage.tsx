import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { AvatarCircle, LogoMark } from "@/components/hero/Logo";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/appStore";
import { DEMO_STUDENTS } from "@/api/mockData";
import { SUBJECT_META } from "@/lib/subjects";

/** 演示账号 → 学生 ID 映射（Mock 登录，真实后端就绪后替换） */
const DEMO_ACCOUNTS: Record<string, string> = {
  xiaoming: "stu_demo_001",
  xiaohong: "stu_demo_002",
};

const SUBJECT_IDS = ["math", "chinese", "english"] as const;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const login = useAppStore((s) => s.login);
  const savedGrade = useAppStore((s) => s.grade);
  const setGrade = useAppStore((s) => s.setGrade);
  // 被登录守卫拦截时的原页面，登录后回到那里
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [isRegister, setIsRegister] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // 账号登录
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  // 注册
  const [nickname, setNickname] = useState("");
  const [regAccount, setRegAccount] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // 年级选择（1-6），默认取上次选择
  const [selectedGrade, setSelectedGrade] = useState(savedGrade);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // 已登录访问 /login 时直接回首页
  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  /** 进入前先落定年级 */
  function enter(studentId: string, grade = selectedGrade) {
    setGrade(grade);
    login(studentId, remember);
    navigate(from, { replace: true });
  }

  function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!account.trim() || !password) {
      setError("请输入账号和密码");
      return;
    }
    const sid = DEMO_ACCOUNTS[account.trim().toLowerCase()];
    if (!sid) {
      setNotice("演示环境：未匹配到预置账号，已为你创建新账号并登录");
      setGrade(selectedGrade);
      login("stu_demo_001", remember, account.trim());
      navigate(from, { replace: true });
      return;
    }
    enter(sid);
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !regAccount.trim()) {
      setError("请填写昵称和账号");
      return;
    }
    if (regPassword.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    setError(null);
    setNotice(`注册成功，欢迎你，${nickname.trim()}！`);
    setGrade(selectedGrade);
    login("stu_demo_001", remember, nickname.trim());
    navigate(from, { replace: true });
  }

  return (
    <div className="relative flex h-full overflow-hidden bg-background">
      {/* 晴空背景：蓝天 + 太阳 + 白云（右侧登录区可见） */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#7ec9f2] via-[#bfe6ff] to-[#eef9ff]" />
        <div className="sky-sun absolute top-20 right-[7%] h-32 w-32" />
        <div
          className="sky-cloud absolute left-[8%] top-[13%] h-5 w-20 opacity-90"
          style={{ animation: "cloud-drift 26s ease-in-out infinite" }}
        />
        <div
          className="sky-cloud absolute bottom-[13%] right-[5%] h-6 w-24 opacity-80"
          style={{ animation: "cloud-drift 30s ease-in-out 2s infinite" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#ffe8c2]/60 to-transparent" />
      </div>

      {/* 左侧品牌区（日出阳光渐变，配色为 ai-study 暖阳色系） */}
      <aside className="relative hidden w-[46%] shrink-0 overflow-hidden bg-gradient-to-br from-[#fcd34d] via-[#f59e0b] to-[#f97316] md:flex md:flex-col md:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-20 -top-24 h-96 w-96 rounded-full bg-white/25 blur-3xl" />
          <div className="absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-96 w-96 rounded-full bg-[#f97316]/25 blur-3xl" />
        </div>

        <header className="relative flex items-center gap-3 p-10">
          <LogoMark className="h-11 w-11 rounded-xl" />
          <div>
            <div className="text-xl font-black tracking-wide text-[#5b2406]">ai-study</div>
            <div className="text-xs text-[#5b2406]/70">AI 自适应学习伙伴</div>
          </div>
        </header>

        <div className="relative px-10 pb-6">
          <h2 className="font-serif-display text-[34px] font-bold leading-snug text-[#5b2406]">
            让每个孩子
            <br />
            都拥有专属的
            <br />
            <span className="text-[#7c2d12]">AI 学习伙伴</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#5b2406]/75">
            3 分钟三科小诊断，AI 实时生成专属学习路径，
            语数英自适应伴学，让进步看得见。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {SUBJECT_IDS.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#5b2406]/15 bg-white/30 px-3.5 py-1.5 text-sm font-semibold text-[#5b2406] backdrop-blur-sm"
              >
                <span aria-hidden>{SUBJECT_META[id].icon}</span>
                {SUBJECT_META[id].label}
              </span>
            ))}
          </div>
        </div>

        <footer className="relative p-10 text-xs text-[#5b2406]/55">
          2026 iFLYTEK AI 开发者大赛 · 小学语数英自适应伴学 Agent
        </footer>
      </aside>

      {/* 右侧登录区 */}
      <main className="relative flex min-w-0 flex-1 items-center justify-center overflow-y-auto px-4 py-8 md:px-8">
        <div className="w-full max-w-md">
          {/* 移动端品牌 */}
          <div className="mb-6 flex items-center justify-center gap-2.5 md:hidden">
            <LogoMark className="h-10 w-10" />
            <span className="text-lg font-black tracking-wide text-foreground">
              ai-study <span className="text-xs font-medium text-muted-foreground">AI 学习伙伴</span>
            </span>
          </div>

          <div className="animate-scale-in rounded-3xl border border-border bg-card/90 p-6 shadow-[0_20px_50px_rgba(217,119,6,0.14)] backdrop-blur-md sm:p-8">
            <h1 className="text-2xl font-black text-foreground">
              {isRegister ? "创建账号 🎒" : "欢迎回来 👋"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isRegister
                ? "注册后即可开启三科自适应伴学"
                : "登录后继续你的学习之旅"}
            </p>

            <form className="mt-5 space-y-4" onSubmit={isRegister ? handleRegisterSubmit : handleAccountSubmit}>
              {/* 年级选择：1-6 年级，知识库按年级加载题目与学习内容 */}
              <Field label="我的年级">
                <GradePicker value={selectedGrade} onChange={setSelectedGrade} />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  选择年级后，诊断题与学习内容将匹配该年级的教材知识库
                </p>
              </Field>
              {isRegister ? (
                <>
                  <Field label="昵称">
                    <Input
                      placeholder="孩子怎么称呼？"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={12}
                    />
                  </Field>
                  <Field label="账号">
                    <Input
                      placeholder="设置登录账号（英文或数字）"
                      value={regAccount}
                      onChange={(e) => setRegAccount(e.target.value)}
                      maxLength={20}
                    />
                  </Field>
                  <Field label="密码">
                    <Input
                      type={showPwd ? "text" : "password"}
                      placeholder="至少 6 位"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="账号">
                    <Input
                      placeholder="用户名 / 账号"
                      autoComplete="username"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                    />
                  </Field>
                  <Field label="密码">
                    <div className="relative">
                      <Input
                        type={showPwd ? "text" : "password"}
                        placeholder="请输入密码"
                        autoComplete="current-password"
                        className="pr-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={showPwd ? "隐藏密码" : "显示密码"}
                      >
                        {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </Field>
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex cursor-pointer select-none items-center gap-2 text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 accent-[#e8830c]"
                      />
                      记住我
                    </label>
                    <button
                      type="button"
                      onClick={() => setNotice("请联系班级老师或管理员重置密码")}
                      className="font-semibold text-muted-foreground transition hover:text-primary"
                    >
                      忘记密码？
                    </button>
                  </div>
                </>
              )}

              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              {notice && <p className="text-sm font-medium text-[#b45309]">{notice}</p>}

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e8830c] text-base font-bold text-white shadow-[0_10px_24px_rgba(217,119,6,0.38)] transition hover:bg-[#d97706] active:scale-[0.98]"
              >
                <Lock size={16} strokeWidth={2.6} />
                {isRegister ? "注册并进入" : "登 录"}
              </button>
            </form>

            {/* 第三方登录 + 注册入口（登录模式） */}
            {!isRegister && (
              <>
                <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  其他登录方式
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="mt-4 flex justify-center gap-5">
                  <ThirdPartyButton label="微信" onClick={() => enter("stu_demo_001")} />
                  <ThirdPartyButton label="QQ" onClick={() => enter("stu_demo_001")} />
                </div>
                <p className="mt-5 text-center text-sm text-muted-foreground">
                  还没有账号？
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setError(null);
                      setNotice(null);
                    }}
                    className="ml-1 font-bold text-[#e8830c] transition hover:underline"
                  >
                    立即注册
                  </button>
                </p>
              </>
            )}

            {isRegister && (
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                  setNotice(null);
                }}
                className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
              >
                <ArrowLeft size={15} strokeWidth={2.4} />
                返回登录
              </button>
            )}
          </div>

          {/* 演示学生快速进入 */}
          {!isRegister && (
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">演示账号 · 点击直接进入学习空间</p>
              <div className="mt-3 flex justify-center gap-4">
                {DEMO_STUDENTS.map((s, i) => (
                  <button
                    key={s.student_id}
                    type="button"
                    onClick={() => enter(s.student_id, s.grade)}
                    className="group flex flex-col items-center gap-1.5"
                  >
                    <AvatarCircle
                      label={s.name}
                      index={i}
                      className="h-12 w-12 text-base transition group-hover:scale-105 group-hover:shadow-[0_6px_18px_rgba(217,119,6,0.28)]"
                    />
                    <span className="text-xs font-semibold text-muted-foreground transition group-hover:text-foreground">
                      {s.name}（{s.grade} 年级）
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground/85">{label}</span>
      {children}
    </label>
  );
}

/** 1-6 年级选择器（选中态暖橙色高亮） */
function GradePicker({ value, onChange }: { value: number; onChange: (g: number) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="选择年级">
      {[1, 2, 3, 4, 5, 6].map((g) => (
        <button
          key={g}
          type="button"
          role="radio"
          aria-checked={value === g}
          onClick={() => onChange(g)}
          className={`flex h-10 items-center justify-center rounded-lg border text-sm font-bold transition active:scale-95 ${
            value === g
              ? "border-[#e8830c] bg-[#e8830c] text-white shadow-[0_4px_12px_rgba(217,119,6,0.35)]"
              : "border-border bg-muted/60 text-foreground/70 hover:border-[#e8830c]/50 hover:text-[#e8830c]"
          }`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

function ThirdPartyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-sm font-bold text-muted-foreground transition hover:border-primary/30 hover:text-foreground hover:shadow-[0_4px_14px_rgba(217,119,6,0.14)] active:scale-95"
      aria-label={`使用${label}登录`}
      title={`使用${label}登录（演示环境：直接进入）`}
    >
      {label}
    </button>
  );
}
