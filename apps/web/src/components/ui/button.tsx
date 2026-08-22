import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "ghost" | "destructive" | "outline" | "hero" | "hero-outline";
type Size = "default" | "sm" | "lg" | "icon" | "xl";

const variants: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(139,92,246,0.35)] hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-white/15 bg-transparent hover:bg-white/5",
  hero: "bg-gradient-to-b from-[hsl(24,100%,72%)] to-[hsl(18,98%,53%)] text-white hover:opacity-90 rounded-lg text-lg font-medium",
  "hero-outline":
    "bg-white text-[hsl(240,10%,10%)] hover:bg-[hsl(240,10%,88%)] rounded-lg text-lg font-medium",
};

const sizes: Record<Size, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-12 rounded-xl px-8 text-base",
  icon: "h-10 w-10",
  xl: "h-14 px-10 py-4",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-95",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
