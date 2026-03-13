import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { UseFormRegisterReturn } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  register?: UseFormRegisterReturn;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, hint, error, options, placeholder, register, className, id, ...props },
    ref
  ) => {
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
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-th-border bg-th-surface text-sm text-th-text outline-none transition-all appearance-none",
            "focus:border-[var(--th-accent,#6366f1)] focus:ring-2 focus:ring-[var(--th-accent,#6366f1)]/10",
            error && "border-[#FF453A]/50 focus:border-[#FF453A] focus:ring-[#FF453A]/10",
            className
          )}
          style={{
            height: 44,
            paddingLeft: 14,
            paddingRight: 36,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
          }}
          {...register}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = "Select";
