import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  accent?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-th-surface-hover text-th-text border border-[var(--th-border)] hover:bg-[var(--th-surface-hover)] active:bg-[var(--th-surface-hover)] backdrop-blur-sm disabled:opacity-40",
  secondary:
    "bg-th-surface text-th-secondary border border-th-border hover:bg-th-surface-hover hover:text-th-text disabled:opacity-40",
  ghost:
    "bg-transparent text-th-secondary hover:bg-th-surface-hover hover:text-th-secondary disabled:opacity-30",
  danger:
    "bg-transparent text-[#FF453A] border border-th-border hover:bg-[rgba(255,69,58,0.1)] hover:border-[rgba(255,69,58,0.3)] disabled:opacity-40",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[12px]",
  md: "px-4 py-2 text-[13px]",
  lg: "px-5 py-2.5 text-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      accent,
      className,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const accentStyle =
      accent && variant === "primary"
        ? { backgroundColor: accent + "22", borderColor: accent + "44", ...style }
        : style;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--th-border)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--th-bg)]",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        style={accentStyle}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
