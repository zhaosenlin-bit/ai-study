import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Action {
  label: string;
  icon?: string;
  primary?: boolean;
  onClick: () => void;
}

export function BottomBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  let actions: Action[] = [];
  let hint = "";

  if (pathname === "/") {
    hint = "准备好开始今天的学习了吗？";
    actions = [
      { label: "开始三科诊断", icon: "🧪", primary: true, onClick: () => navigate("/diagnosis") },
    ];
  } else if (pathname === "/diagnosis") {
    hint = "跟随 AI 伙伴完成诊断，找出薄弱点";
  } else if (pathname.startsWith("/chat/")) {
    hint = "答错也没关系，AI 伙伴会分步引导你";
    actions = [
      { label: "回到今日任务", onClick: () => navigate("/") },
    ];
  } else if (pathname === "/path") {
    hint = "先攻克最薄弱的环节，效率更高";
    actions = [
      { label: "去辅导薄弱点", icon: "🧑‍🏫", primary: true, onClick: () => navigate("/chat/math") },
    ];
  } else if (pathname === "/mistakes") {
    hint = "错题是复习的最好教材";
    actions = [
      { label: "开始复习错题", icon: "🔁", primary: true, onClick: () => navigate("/chat/math") },
    ];
  } else if (pathname === "/report") {
    hint = "家长可以随时查看孩子的学习报告";
    actions = [
      { label: "查看学习路径", onClick: () => navigate("/path") },
    ];
  }

  if (pathname === "/demo") return null;

  return (
    <footer className="relative z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-t border-border bg-background/70 px-6 backdrop-blur-md">
      <p className="hidden text-sm text-muted-foreground sm:block">{hint}</p>
      <div className="ml-auto flex items-center gap-3">
        {actions.map((a) => (
          <Button
            key={a.label}
            variant={a.primary ? "default" : "outline"}
            size="lg"
            onClick={a.onClick}
          >
            {a.icon && <span aria-hidden>{a.icon}</span>}
            {a.label}
          </Button>
        ))}
      </div>
    </footer>
  );
}
