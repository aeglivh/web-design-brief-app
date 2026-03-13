import { cn } from "@/lib/cn";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  accent?: string;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  accent,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn("flex", className)} style={{ gap: 6 }}>
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum <= currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={i} className="flex-1 text-center">
            <div
              className={cn(
                "rounded-full transition-all",
                isActive ? "bg-th-muted" : "bg-th-surface-hover"
              )}
              style={{
                height: 5,
                marginBottom: 8,
                ...(isActive && accent ? { backgroundColor: accent } : {}),
              }}
            />
            <span
              className={cn(
                "text-[11px] leading-tight tracking-wide transition-colors",
                isCurrent
                  ? "text-th-text font-semibold"
                  : isActive
                    ? "text-th-secondary font-medium"
                    : "text-th-muted font-normal"
              )}
              style={isCurrent && accent ? { color: accent } : undefined}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
