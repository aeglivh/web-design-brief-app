import { cn } from "@/lib/cn";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  label?: string;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  presets = [],
  label,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-[13px] font-medium text-th-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 mb-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 border border-th-border rounded-lg cursor-pointer p-0.5 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-10 rounded-lg border border-th-border bg-th-surface px-3 text-sm text-th-text outline-none focus:border-[rgba(var(--th-border-rgb,255,255,255),0.2)] focus:ring-1 focus:ring-th-border transition-all font-mono"
        />
      </div>
      {presets.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {presets.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => onChange(c)}
              className={cn(
                "w-6 h-6 rounded-md cursor-pointer border transition-all",
                value === c
                  ? "ring-1 ring-th-border ring-offset-1 ring-offset-[var(--th-bg,#050505)] border-th-muted"
                  : "border-transparent hover:border-th-muted"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
