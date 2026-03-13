import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { UseFormRegisterReturn } from "react-hook-form";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  register?: UseFormRegisterReturn;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, register, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-th-secondary"
            style={{ marginBottom: 8 }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-th-border bg-th-surface text-sm text-th-text outline-none transition-all",
            "placeholder:text-th-placeholder",
            "focus:border-[var(--th-accent,#6366f1)] focus:ring-2 focus:ring-[var(--th-accent,#6366f1)]/10",
            error && "border-[#FF453A]/50 focus:border-[#FF453A] focus:ring-[#FF453A]/10",
            className
          )}
          style={{ height: 44, paddingLeft: 14, paddingRight: 14 }}
          {...register}
          {...props}
        />
        {hint && !error && (
          <p className="text-[11px] text-th-muted" style={{ marginTop: 6 }}>{hint}</p>
        )}
        {error && (
          <p className="text-[11px] text-[#FF453A]" style={{ marginTop: 6 }}>{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
