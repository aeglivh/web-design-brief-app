import { useState } from "react";
import { isLight } from "@/lib/utils";

interface Milestone {
  phase: string;
  weeks: string;
  deliverable: string;
}

interface PortalPhasesProps {
  milestones: Milestone[];
  projectPhases?: Milestone[] | null;
  portalStatus: string;
  accent: string;
}

// Map portal_status to a rough phase index
const STATUS_PHASE_MAP: Record<string, number> = {
  intake_complete: -1,
  brief_published: 0,
  quote_published: 0,
  contract_published: 0,
  contract_signed: 0,
  in_progress: 1,
  complete: 999,
};

export function PortalPhases({ milestones, projectPhases, portalStatus, accent }: PortalPhasesProps) {
  // Prefer designer-set phases, fall back to contract milestones
  const phases = (projectPhases && projectPhases.length > 0) ? projectPhases : milestones;
  if (!phases || phases.length === 0) return null;

  const [open, setOpen] = useState(true);
  const statusIndex = STATUS_PHASE_MAP[portalStatus] ?? -1;
  const isComplete = portalStatus === "complete";
  const accentText = isLight(accent) ? "rgba(0,0,0,0.85)" : "#fff";

  return (
    <div
      className="rounded-[16px]"
      style={{
        border: "1px solid var(--th-border-light)",
        background: "var(--th-surface)",
        padding: 28,
        marginBottom: 20,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between cursor-pointer"
        style={{ background: "none", border: "none", padding: 0 }}
      >
        <p
          className="text-[10px] font-medium uppercase"
          style={{
            color: "var(--th-text-muted)",
            letterSpacing: "0.15em",
            margin: 0,
          }}
        >
          Project Timeline
        </p>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--th-text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? 1000 : 0,
          opacity: open ? 1 : 0,
          transition: "max-height 0.3s ease, opacity 0.2s ease",
          marginTop: open ? 20 : 0,
        }}
      >
        {phases.map((m, i) => {
          const done = isComplete || i < statusIndex;
          const active = !isComplete && i === statusIndex;

          return (
            <div key={i} style={{ display: "flex", gap: 16, position: "relative" }}>
              {/* Left: connector + dot */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 20,
                  flexShrink: 0,
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: active ? 14 : 10,
                    height: active ? 14 : 10,
                    borderRadius: "50%",
                    backgroundColor: done || active ? accent : "var(--th-border)",
                    border: active ? `2px solid ${accent}44` : "none",
                    boxShadow: active ? `0 0 0 4px ${accent}22` : "none",
                    flexShrink: 0,
                    marginTop: 6,
                    zIndex: 1,
                  }}
                />
                {/* Connector line */}
                {i < phases.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      minHeight: 20,
                      backgroundColor: done ? accent + "44" : "var(--th-border)",
                    }}
                  />
                )}
              </div>

              {/* Right: content */}
              <div style={{ flex: 1, paddingBottom: i < phases.length - 1 ? 16 : 0 }}>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <span
                    className="text-[13px] font-medium"
                    style={{
                      color: done || active ? "var(--th-text)" : "var(--th-text-muted)",
                    }}
                  >
                    {m.phase}
                  </span>
                  {active && (
                    <span
                      className="text-[10px] font-semibold uppercase"
                      style={{
                        padding: "2px 8px",
                        borderRadius: 10,
                        backgroundColor: accent,
                        color: accentText,
                        letterSpacing: "0.05em",
                      }}
                    >
                      Current
                    </span>
                  )}
                  {done && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={accent}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div
                  className="flex items-center"
                  style={{ gap: 12, marginTop: 4 }}
                >
                  <span
                    className="text-[11px] font-mono"
                    style={{ color: "var(--th-text-muted)" }}
                  >
                    {m.weeks}
                  </span>
                  <span
                    className="text-[12px]"
                    style={{ color: "var(--th-text-secondary)" }}
                  >
                    {m.deliverable}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
