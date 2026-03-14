import type { PortalUpdate } from "./usePortalData";

interface PortalTimelineProps {
  updates: PortalUpdate[];
  feedbackUpdateIds: string[];
  accent: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PortalTimeline({ updates, feedbackUpdateIds, accent }: PortalTimelineProps) {
  if (updates.length === 0) {
    return (
      <p className="text-[13px]" style={{ color: "var(--th-text-muted)" }}>
        No updates yet. Your designer will post progress here.
      </p>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Vertical line */}
      <div
        style={{
          position: "absolute",
          left: 7,
          top: 6,
          bottom: 6,
          width: 1,
          backgroundColor: "var(--th-border)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {updates.map((update) => {
          const hasFeedback = feedbackUpdateIds.includes(update.id);
          const needsFeedback = update.feedback_requested && !hasFeedback;

          return (
            <div key={update.id} style={{ display: "flex", gap: 16, position: "relative" }}>
              {/* Dot */}
              <div
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  backgroundColor: accent,
                  border: "3px solid var(--th-bg)",
                  flexShrink: 0,
                  marginTop: 2,
                  position: "relative",
                  zIndex: 1,
                }}
              />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex flex-wrap items-center" style={{ gap: 8, marginBottom: 4 }}>
                  {/* Status pill */}
                  <span
                    className="text-[12px] font-medium"
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 10,
                      backgroundColor: "var(--th-surface-hover)",
                      color: "var(--th-text-secondary)",
                    }}
                  >
                    {update.status_label}
                  </span>

                  {/* Feedback needed badge */}
                  {needsFeedback && (
                    <span
                      className="text-[11px] font-medium"
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 10,
                        backgroundColor: "rgba(245,158,11,0.15)",
                        color: "#fbbf24",
                      }}
                    >
                      Feedback needed
                    </span>
                  )}

                  {/* Date */}
                  <span
                    className="text-[11px] font-mono"
                    style={{ color: "var(--th-text-muted)" }}
                  >
                    {formatDate(update.created_at)}
                  </span>
                </div>

                {/* Note */}
                {update.note && (
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "var(--th-text-secondary)", marginTop: 4 }}
                  >
                    {update.note}
                  </p>
                )}

                {/* Link */}
                {update.link_url && (
                  <a
                    href={update.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[12px] font-medium no-underline"
                    style={{
                      marginTop: 8,
                      padding: "6px 14px",
                      borderRadius: 8,
                      backgroundColor: "var(--th-surface-hover)",
                      color: "var(--th-text-secondary)",
                      border: "1px solid var(--th-border-light)",
                      gap: 6,
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    {update.link_label || "View link"}
                  </a>
                )}

                {/* Feedback form placeholder — built in Task 6 */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
