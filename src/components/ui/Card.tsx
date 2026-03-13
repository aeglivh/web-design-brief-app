import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({
  hoverable = false,
  header,
  footer,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-[16px] overflow-hidden",
        hoverable && "transition-all hover:bg-th-surface-hover hover:border-th-border cursor-pointer",
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-th-border-light">{header}</div>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-th-border-light bg-[rgba(var(--th-surface-rgb,255,255,255),0.02)]">
          {footer}
        </div>
      )}
    </div>
  );
}
