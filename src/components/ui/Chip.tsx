import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  accent?: string;
  className?: string;
}

export function Chip({ label, selected, onClick, accent, className }: ChipProps) {
  const style: CSSProperties | undefined =
    selected && accent
      ? { backgroundColor: accent + "18", borderColor: accent + "55", color: "var(--th-text)" }
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl text-[13px] font-medium border transition-all cursor-pointer",
        selected
          ? "bg-th-surface-hover text-th-text border-th-muted"
          : "bg-th-surface text-th-secondary border-th-border hover:border-th-muted hover:bg-th-surface-hover",
        className
      )}
      style={{ padding: "10px 16px", ...style }}
    >
      {label}
    </button>
  );
}
