import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "text-[#32D74B] bg-[#32D74B]/10 border border-[#32D74B]/20",
  warning: "text-[#FF9F0A] bg-[#FF9F0A]/10 border border-[#FF9F0A]/20",
  error: "text-[#FF453A] bg-[#FF453A]/10 border border-[#FF453A]/20",
  info: "text-[#0A84FF] bg-[#0A84FF]/10 border border-[#0A84FF]/20",
  neutral: "text-th-secondary bg-th-surface border border-th-border",
};

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
