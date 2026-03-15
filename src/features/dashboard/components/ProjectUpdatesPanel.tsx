import { useState, useEffect } from "react";
import { authFetch, API_BASE } from "@/lib/api";

const STATUS_PRESETS = [
  "Design started",
  "Wireframes ready",
  "Homepage draft",
  "Inner pages draft",
  "Revisions round",
  "Development started",
  "Staging ready",
  "Final review",
  "Launch day",
  "Project complete",
];

interface ProjectUpdate {
  id: string;
  status_label: string;
  note: string | null;
  link_url: string | null;
  link_label: string | null;
  feedback_requested: boolean;
  created_at: string;
}

interface ProjectFeedback {
  id: string;
  update_id: string;
  comment: string;
  created_at: string;
}

interface ProjectUpdatesPanelProps {
  briefId: string;
  accent: string;
}

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProjectUpdatesPanel({ briefId, accent }: ProjectUpdatesPanelProps) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [feedback, setFeedback] = useState<ProjectFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [statusLabel, setStatusLabel] = useState(STATUS_PRESETS[0]);
  const [customLabel, setCustomLabel] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [note, setNote] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [feedbackRequested, setFeedbackRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const FINISH_LABELS = ["project complete", "launch day"];

  const loadUpdates = async () => {
    try {
      const [updRes, fbRes] = await Promise.all([
        authFetch(`${API_BASE}/api/project-updates?brief_id=${briefId}`),
        authFetch(`${API_BASE}/api/project-feedback?brief_id=${briefId}`),
      ]);
      const updData = await updRes.json();
      const fbData = await fbRes.json();
      setUpdates(updData.updates || []);
      setFeedback(fbData.feedback || []);
    } catch {
      // silent
    }
    setLoading(false);
  };

  const isProjectComplete = updates.some((u) =>
    FINISH_LABELS.includes(u.status_label.toLowerCase())
  );

  useEffect(() => {
    loadUpdates();
  }, [briefId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const label = useCustom ? customLabel.trim() : statusLabel;
    if (!label) {
      setError("Status label is required");
      setSubmitting(false);
      return;
    }

    try {
      const res = await authFetch(`${API_BASE}/api/project-updates`, {
        method: "POST",
        body: JSON.stringify({
          brief_id: briefId,
          status_label: label,
          note: note.trim() || undefined,
          link_url: linkUrl.trim() || undefined,
          link_label: linkLabel.trim() || undefined,
          feedback_requested: feedbackRequested,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Reset form
        setNote("");
        setLinkUrl("");
        setLinkLabel("");
        setFeedbackRequested(false);
        setCustomLabel("");
        setUseCustom(false);
        // Reload updates
        loadUpdates();
      } else {
        setError(data.error || "Failed to post update");
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  };

  return (
    <div>
      {/* Post Update Form */}
      <div
        className="rounded-[16px]"
        style={{
          border: "1px solid var(--th-border-light)",
          background: "var(--th-surface)",
          padding: 24,
          marginBottom: 24,
        }}
      >
        <p
          className="text-[10px] font-medium uppercase"
          style={{ color: "var(--th-text-muted)", letterSpacing: "0.15em", marginBottom: 16 }}
        >
          Post Update
        </p>

        {isProjectComplete ? (
          <div className="flex items-center" style={{ gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-[13px] font-medium" style={{ color: "var(--th-text-secondary)" }}>
              Project complete — no further updates can be posted.
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          {/* Status label */}
          <div style={{ marginBottom: 14 }}>
            <label className="text-[12px] font-medium" style={{ color: "var(--th-text-secondary)", display: "block", marginBottom: 6 }}>
              Status
            </label>
            {!useCustom ? (
              <div className="flex items-center" style={{ gap: 8 }}>
                <select
                  value={statusLabel}
                  onChange={(e) => setStatusLabel(e.target.value)}
                  className="flex-1 rounded-xl border text-[13px] outline-none transition-colors"
                  style={{
                    padding: "10px 14px",
                    borderColor: "var(--th-border)",
                    backgroundColor: "var(--th-input-bg)",
                    color: "var(--th-text)",
                  }}
                >
                  {STATUS_PRESETS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setUseCustom(true)}
                  className="text-[11px] font-medium cursor-pointer bg-transparent border-0"
                  style={{ color: "var(--th-text-muted)", whiteSpace: "nowrap" }}
                >
                  Custom
                </button>
              </div>
            ) : (
              <div className="flex items-center" style={{ gap: 8 }}>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Custom status label"
                  className="flex-1 rounded-xl border text-[13px] outline-none transition-colors"
                  style={{
                    padding: "10px 14px",
                    borderColor: "var(--th-border)",
                    backgroundColor: "var(--th-input-bg)",
                    color: "var(--th-text)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => { setUseCustom(false); setCustomLabel(""); }}
                  className="text-[11px] font-medium cursor-pointer bg-transparent border-0"
                  style={{ color: "var(--th-text-muted)", whiteSpace: "nowrap" }}
                >
                  Presets
                </button>
              </div>
            )}
          </div>

          {/* Note */}
          <div style={{ marginBottom: 14 }}>
            <label className="text-[12px] font-medium" style={{ color: "var(--th-text-secondary)", display: "block", marginBottom: 6 }}>
              Note <span style={{ fontWeight: 400, color: "var(--th-text-muted)" }}>(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note for the client..."
              className="w-full rounded-xl border text-[13px] outline-none transition-colors resize-y"
              style={{
                padding: "10px 14px",
                borderColor: "var(--th-border)",
                backgroundColor: "var(--th-input-bg)",
                color: "var(--th-text)",
              }}
            />
          </div>

          {/* Link URL + Label */}
          <div className="grid grid-cols-2" style={{ gap: 10, marginBottom: 14 }}>
            <div>
              <label className="text-[12px] font-medium" style={{ color: "var(--th-text-secondary)", display: "block", marginBottom: 6 }}>
                Link URL <span style={{ fontWeight: 400, color: "var(--th-text-muted)" }}>(optional)</span>
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border text-[13px] outline-none transition-colors"
                style={{
                  padding: "10px 14px",
                  borderColor: "var(--th-border)",
                  backgroundColor: "var(--th-input-bg)",
                  color: "var(--th-text)",
                }}
              />
            </div>
            <div>
              <label className="text-[12px] font-medium" style={{ color: "var(--th-text-secondary)", display: "block", marginBottom: 6 }}>
                Link label
              </label>
              <input
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="View staging site"
                className="w-full rounded-xl border text-[13px] outline-none transition-colors"
                style={{
                  padding: "10px 14px",
                  borderColor: "var(--th-border)",
                  backgroundColor: "var(--th-input-bg)",
                  color: "var(--th-text)",
                }}
              />
            </div>
          </div>

          {/* Feedback toggle */}
          <div className="flex items-center" style={{ gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setFeedbackRequested(!feedbackRequested)}
              className="relative cursor-pointer"
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                border: "none",
                backgroundColor: feedbackRequested ? accent : "var(--th-border)",
                transition: "background-color 0.2s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: feedbackRequested ? 18 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  transition: "left 0.2s",
                }}
              />
            </button>
            <span className="text-[12px] font-medium" style={{ color: "var(--th-text-secondary)" }}>
              Request feedback from client
            </span>
          </div>

          {error && (
            <p className="text-[12px]" style={{ color: "#ef4444", marginBottom: 12 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full text-[13px] font-medium cursor-pointer transition-all border hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              padding: "10px 0",
              backgroundColor: accent + "22",
              borderColor: accent + "44",
              color: "var(--th-text)",
            }}
          >
            {submitting ? "Posting..." : "Post Update"}
          </button>
        </form>
        )}
      </div>

      {/* Past Updates Timeline */}
      <div
        className="rounded-[16px]"
        style={{
          border: "1px solid var(--th-border-light)",
          background: "var(--th-surface)",
          padding: 24,
        }}
      >
        <p
          className="text-[10px] font-medium uppercase"
          style={{ color: "var(--th-text-muted)", letterSpacing: "0.15em", marginBottom: 16 }}
        >
          Update History
        </p>

        {loading ? (
          <p className="text-[13px]" style={{ color: "var(--th-text-muted)" }}>Loading...</p>
        ) : updates.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--th-text-muted)" }}>No updates posted yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {updates.map((u) => (
              <div
                key={u.id}
                style={{
                  paddingBottom: 16,
                  borderBottom: "1px solid var(--th-border-light)",
                }}
              >
                <div className="flex flex-wrap items-center" style={{ gap: 8, marginBottom: 4 }}>
                  <span
                    className="text-[11px] font-medium"
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 10,
                      backgroundColor: statusPillStyle(u.status_label).bg,
                      color: statusPillStyle(u.status_label).color,
                    }}
                  >
                    {u.status_label}
                  </span>
                  {u.feedback_requested && (
                    feedback.some((f) => f.update_id === u.id) ? (
                      <span
                        className="text-[10px] font-medium"
                        style={{
                          padding: "2px 8px",
                          borderRadius: 10,
                          backgroundColor: "rgba(34,197,94,0.15)",
                          color: "#4ade80",
                        }}
                      >
                        Feedback received
                      </span>
                    ) : (
                      <span
                        className="text-[10px] font-medium"
                        style={{
                          padding: "2px 8px",
                          borderRadius: 10,
                          backgroundColor: "rgba(245,158,11,0.15)",
                          color: "#fbbf24",
                        }}
                      >
                        Awaiting feedback
                      </span>
                    )
                  )}
                  <span className="text-[11px] font-mono" style={{ color: "var(--th-text-muted)" }}>
                    {formatDate(u.created_at)}
                  </span>
                </div>
                {u.note && (
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--th-text-secondary)", marginTop: 4 }}>
                    {u.note}
                  </p>
                )}
                {u.link_url && (
                  <a
                    href={u.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[11px] font-medium no-underline"
                    style={{
                      marginTop: 6,
                      padding: "4px 10px",
                      borderRadius: 6,
                      backgroundColor: "var(--th-surface-hover)",
                      color: "var(--th-text-secondary)",
                      border: "1px solid var(--th-border-light)",
                      gap: 4,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    {u.link_label || "View link"}
                  </a>
                )}
                {/* Client feedback */}
                {(() => {
                  const fb = feedback.find((f) => f.update_id === u.id);
                  if (!fb) return null;
                  return (
                    <div
                      className="rounded-lg"
                      style={{
                        marginTop: 8,
                        padding: "8px 12px",
                        border: "1px solid var(--th-border-light)",
                        backgroundColor: "var(--th-surface-hover)",
                      }}
                    >
                      <div className="flex items-center" style={{ gap: 6, marginBottom: 4 }}>
                        <span className="text-[11px] font-medium" style={{ color: "var(--th-text-secondary)" }}>
                          Client feedback
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: "var(--th-text-muted)" }}>
                          {formatDate(fb.created_at)}
                        </span>
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ color: "var(--th-text-secondary)" }}>
                        {fb.comment}
                      </p>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
