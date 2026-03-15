import { Fragment } from "react";
import { isLight } from "@/lib/utils";

const STAGES = [
  { key: "intake", label: "Intake" },
  { key: "brief", label: "Brief" },
  { key: "quote", label: "Quote" },
  { key: "contract", label: "Contract" },
  { key: "in_progress", label: "In Progress" },
  { key: "launch", label: "Launch Day" },
  { key: "complete", label: "Complete" },
];

const STATUS_TO_STAGE: Record<string, number> = {
  intake_complete: 0,
  brief_published: 1,
  quote_published: 2,
  contract_published: 3,
  contract_signed: 4,
  in_progress: 4,
  launch: 5,
  complete: 6,
};

interface PortalProgressProps {
  portalStatus: string;
  accent: string;
}

export function PortalProgress({ portalStatus, accent }: PortalProgressProps) {
  const activeIndex = STATUS_TO_STAGE[portalStatus] ?? 0;
  const accentText = isLight(accent) ? "rgba(0,0,0,0.85)" : "#fff";

  return (
    <div
      className="rounded-[16px]"
      style={{
        border: "1px solid var(--th-border-light)",
        background: "var(--th-surface)",
        padding: "16px 24px",
        marginBottom: 20,
      }}
    >
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center">
        {STAGES.map((stage, i) => {
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <Fragment key={stage.key}>
              {i > 0 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    minWidth: 12,
                    backgroundColor: i <= activeIndex ? accent : "var(--th-border)",
                  }}
                />
              )}
              <div
                className="flex items-center justify-center text-[11px] font-medium whitespace-nowrap"
                style={{
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 15,
                  flexShrink: 0,
                  backgroundColor: isActive
                    ? accent
                    : isCompleted
                    ? "var(--th-surface-hover)"
                    : "transparent",
                  color: isActive
                    ? accentText
                    : isCompleted
                    ? "var(--th-text-secondary)"
                    : "var(--th-text-muted)",
                  border: !isActive && !isCompleted
                    ? "1px dashed var(--th-border)"
                    : "1px solid transparent",
                }}
              >
                {isCompleted && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: 4 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {stage.label}
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* Mobile: compact pills row */}
      <div className="flex sm:hidden flex-wrap" style={{ gap: 6 }}>
        {STAGES.map((stage, i) => {
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <div
              key={stage.key}
              className="flex items-center text-[10px] font-medium"
              style={{
                height: 24,
                padding: "0 10px",
                borderRadius: 12,
                backgroundColor: isActive
                  ? accent
                  : isCompleted
                  ? "var(--th-surface-hover)"
                  : "transparent",
                color: isActive
                  ? accentText
                  : isCompleted
                  ? "var(--th-text-secondary)"
                  : "var(--th-text-muted)",
              }}
            >
              {isCompleted && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: 3 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {stage.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
