import * as React from "react";
import { cn } from "@/lib/工具函数";

export function 徽章({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
