import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** 品牌 Logo：书本 + 星星徽标 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="13" fill="#e8830c" />
      <path
        d="M24 12.5c-3-2.3-7.2-3-10.8-1.7v22.9c3.6-1.3 7.8-.6 10.8 1.7 3-2.3 7.2-3 10.8-1.7V10.8C31.2 9.5 27 10.2 24 12.5z"
        fill="#FFF7E6"
      />
      <path d="M24 12.5v22.9" stroke="#b45309" strokeWidth="1.8" />
      <path
        d="M32.6 6.2l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"
        fill="#E86A10"
      />
      <circle cx="14.5" cy="33" r="1.9" fill="#E86A10" />
      <circle cx="33.5" cy="31" r="1.3" fill="#FFF7E6" />
    </svg>
  );
}

const AVATAR_GRADIENTS = [
  "from-[#f59e0b] to-[#fcd34d]",
  "from-[#E86A10] to-[#f7b37f]",
  "from-[#2563eb] to-[#8fc1f7]",
];

/** 圆形头像（取姓名首字） */
export function AvatarCircle({
  label,
  index = 0,
  className,
}: {
  label: string;
  index?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
        AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
        className,
      )}
      aria-hidden
    >
      {label.slice(0, 1)}
    </span>
  );
}

/** 头像堆叠：若干头像 + 绿色 Plus 圆钮 */
export function AvatarStack({
  names,
  plus = true,
  size = "h-7 w-7",
  className,
}: {
  names: string[];
  plus?: boolean;
  size?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center", className)} aria-hidden>
      <div className="flex -space-x-2.5">
        {names.map((n, i) => (
          <AvatarCircle
            key={`${n}-${i}`}
            label={n}
            index={i}
            className={cn(size, "border-2 border-white text-[11px]")}
          />
        ))}
        {plus && (
          <span
            className={cn(
              size,
              "flex items-center justify-center rounded-full border-2 border-white bg-leaf text-white shadow-sm",
            )}
          >
            <Plus size={14} strokeWidth={3} />
          </span>
        )}
      </div>
    </div>
  );
}
