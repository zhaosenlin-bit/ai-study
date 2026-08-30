import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/appStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const LOGIN_STORAGE_KEY = "tutor_login";

export function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("请输入昵称");
      return;
    }
    if (pass.length < 4) {
      setError("密码至少 4 位（演示环境任意填写）");
      return;
    }
    const nickname = name.trim();
    localStorage.setItem(
      LOGIN_STORAGE_KEY,
      JSON.stringify({ name: nickname, ts: Date.now() }),
    );
    // 把登录昵称同步到 store，TopBar 等组件即可显示真实姓名
    useAppStore.setState({ studentId: nickname, studentName: nickname });
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-3xl">☀️</div>
          <CardTitle className="text-xl">AI 学习伙伴</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            登录后开始你的自适应学习之旅
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Input
              placeholder="昵称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
            <Input
              type="password"
              placeholder="密码（至少 4 位）"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
            {error && (
              <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
            )}
            <Button type="submit" className="w-full">
              进入学习空间
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
