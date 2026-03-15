import { useState } from "react";
import { API_BASE } from "@/lib/api";
import type { PortalUpdate } from "./usePortalData";

function statusPillStyle(label: string): { bg: string; color: string } {
  const l = label.toLowerCase();
  if (l === "project complete") return { bg: "rgba(34,197,94,0.15)", color: "#4ade80" };
  if (l === "launch day") return { bg: "rgba(244,114,182,0.15)", color: "#f472b6" };
  if (l.includes("draft") || l.includes("design")) return { bg: "rgba(99,102,241,0.15)", color: "#818cf8" };
  if (l.includes("development") || l.includes("staging")) return { bg: "rgba(168,85,247,0.15)", color: "#c084fc" };
  if (l.includes("wireframe") || l.includes("started")) return { bg: "rgba(56,189,248,0.15)", color: "#38bdf8" };
  if (l.includes("review") || l.includes("revision")) return { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" };
  return { bg: "var(--th-surface-hover)", color: "var(--th-text-secondary)" };
}

interface PortalTimelineProps {
  updates: PortalUpdate[];
  feedbackUpdateIds: string[];
  briefId: string;
  accent: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function FeedbackForm({
  briefId,
  updateId,
  accent,
  onSubmitted,
}: {
  briefId: string;
  updateId: string;
  accent: string;
  onSubmitted: () => void;
}) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/project-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief_id: briefId,
          update_id: updateId,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSubmitted();
      } else {
        setError(data.error || "Failed to submit feedback");
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  };

  return (
    <div
      className="rounded-xl"
      style={{
        marginTop: 12,
        padding: 16,
        border: "1px solid var(--th-border-light)",
        backgroundColor: "var(--th-surface-hover)",
      }}
    >
      <p className="text-[12px] font-medium" style={{ color: "var(--th-text-secondary)", marginBottom: 10 }}>
        Share your thoughts on this update
      </p>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your feedback..."
        rows={3}
        className="w-full rounded-lg border text-[13px] outline-none resize-y"
        style={{
          padding: "8px 12px",
          borderColor: "var(--th-border)",
          backgroundColor: "var(--th-input-bg)",
          color: "var(--th-text)",
          marginBottom: 10,
        }}
      />

      {error && (
        <p className="text-[11px]" style={{ color: "#ef4444", marginBottom: 8 }}>{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!comment.trim() || submitting}
        className="rounded-full text-[12px] font-medium cursor-pointer transition-all border hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          padding: "7px 20px",
          backgroundColor: "rgba(63,63,70,0.08)",
          borderColor: "rgba(63,63,70,0.15)",
          color: "var(--th-text)",
        }}
      >
        {submitting ? "Sending..." : "Send feedback"}
      </button>
    </div>
  );
}

export function PortalTimeline({ updates, feedbackUpdateIds, briefId, accent }: PortalTimelineProps) {
  const [submittedIds, setSubmittedIds] = useState<string[]>([]);

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
          const hasFeedback = feedbackUpdateIds.includes(update.id) || submittedIds.includes(update.id);
          const needsFeedback = update.feedback_requested && !hasFeedback;

          return (
            <div key={update.id} style={{ display: "flex", gap: 16, position: "relative" }}>
              {/* Dot */}
              <div
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  backgroundColor: "#3f3f46",
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
                      backgroundColor: statusPillStyle(update.status_label).bg,
                      color: statusPillStyle(update.status_label).color,
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

                  {/* Feedback submitted badge */}
                  {hasFeedback && update.feedback_requested && (
                    <span
                      className="text-[11px] font-medium"
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 10,
                        backgroundColor: "rgba(34,197,94,0.15)",
                        color: "#4ade80",
                      }}
                    >
                      Feedback sent
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

                {/* Feedback form */}
                {needsFeedback && (
                  <FeedbackForm
                    briefId={briefId}
                    updateId={update.id}
                    accent={accent}
                    onSubmitted={() => setSubmittedIds((prev) => [...prev, update.id])}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
