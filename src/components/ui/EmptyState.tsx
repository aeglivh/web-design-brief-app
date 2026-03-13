import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl py-20 px-8 text-center",
        className
      )}
      style={{
        background: "var(--th-glass-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--th-border-light)",
        boxShadow: "var(--th-glass-shadow)",
      }}
    >
      {icon ? (
        <div className="text-4xl mb-5">{icon}</div>
      ) : (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{
            background: "var(--th-accent-muted)",
            border: "1px solid var(--th-border-light)",
          }}
        >
          <svg className="text-th-secondary" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
      )}
      <h3 className="text-[16px] font-semibold text-th-text mb-2">{title}</h3>
      {description && (
        <p className="text-[13px] text-th-secondary leading-relaxed max-w-xs mx-auto mb-8">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
