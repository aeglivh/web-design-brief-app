import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  error: "border-l-[#FF453A] text-th-text",
  success: "border-l-[#32D74B] text-th-text",
  info: "border-l-[#0A84FF] text-th-text",
};

const iconPaths: Record<AlertVariant, ReactNode> = {
  error: <path d="M12 9v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />,
  success: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
};

export function Alert({ variant = "info", children, className }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-th-surface backdrop-blur-sm border border-th-border border-l-[3px] px-3.5 py-3 text-[13px] flex items-start gap-2.5",
        variantClasses[variant],
        className
      )}
    >
      <svg className="w-4 h-4 shrink-0 mt-0.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {iconPaths[variant]}
      </svg>
      <div>{children}</div>
    </div>
  );
}
