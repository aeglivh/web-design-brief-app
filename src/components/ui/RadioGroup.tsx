import { cn } from "@/lib/cn";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  direction?: "row" | "column";
  accent?: string;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  direction = "row",
  accent,
  className,
}: RadioGroupProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "column" ? "flex-col" : "flex-row flex-wrap",
        className
      )}
      style={{ gap: 10 }}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "flex items-center cursor-pointer text-[13px] font-medium rounded-xl border transition-all",
              selected
                ? "border-th-muted bg-th-surface-hover text-th-text"
                : "border-th-border text-th-secondary hover:border-th-muted hover:bg-th-surface"
            )}
            style={{
              padding: "10px 16px",
              gap: 10,
              ...(selected && accent
                ? { borderColor: accent + "66", backgroundColor: accent + "0D" }
                : {}),
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <div
              className={cn(
                "rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                selected ? "border-th-secondary" : "border-th-muted"
              )}
              style={{
                width: 18,
                height: 18,
                ...(selected && accent ? { borderColor: accent } : {}),
              }}
            >
              {selected && (
                <div
                  className="rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: accent || "var(--th-text)",
                  }}
                />
              )}
            </div>
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
