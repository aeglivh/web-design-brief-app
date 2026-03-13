import { cn } from "@/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-[1.5px]",
  md: "w-5 h-5 border-[1.5px]",
  lg: "w-7 h-7 border-2",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full border-th-border border-t-[var(--th-secondary)] animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}
