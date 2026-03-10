import { useRef, useEffect } from "react";

// ─── parseBrief ───────────────────────────────────────────────────────────────

const SECTION_HEADS = [
  "project overview",
  "design direction",
  "sitemap recommendation",
  "content status",
  "seo assessment",
  "technical scope",
  "designer notes",
];

export function parseBrief(raw) {
  if (!raw) return [];
  const text = raw.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#+\s*/gm, "");
  const lines = text.split("\n");
  const sections = [];
  let cur = null;
  let buf = [];

  function isHead(line) {
    if (/^\d+[\.\:\)]\s+\S/.test(line)) return true;
    const lower = line.toLowerCase();
    return SECTION_HEADS.some(h => lower.startsWith(h));
  }

  function flush() {
    if (!cur) { buf = []; return; }
    const para = buf.join(" ").trim();
    if (para.length > 2) cur.paragraphs.push(para);
    buf = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { flush(); continue; }
    if (isHead(line)) {
      flush();
      if (cur) sections.push(cur);
      cur = { heading: line, paragraphs: [] };
    } else if (cur) {
      buf.push(line);
    }
  }
  flush();
  if (cur) sections.push(cur);
  return sections;
}

// ─── TagsSection ──────────────────────────────────────────────────────────────

export function TagsSection({ tags, acc }) {
  if (!tags) return null;
  const hasTech = tags.techStack?.length > 0;
  const hasKeys = tags.keywords?.length > 0;
  if (!hasTech && !hasKeys) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ borderTop: "1.5px solid #e2e8f0", margin: "8px 0 20px" }} />
      {hasKeys && (
        <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
          {tags.keywords.map((k, i) => (
            <span key={i} style={{ fontSize: 10, color: acc, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>{k}</span>
          ))}
        </div>
      )}
      {hasTech && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tags.techStack.map((t, i) => (
            <span key={i} style={{ background: "#f1f5f9", color: "#334155", borderRadius: 4, padding: "5px 12px", fontSize: 12 }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BriefSummaryCard ─────────────────────────────────────────────────────────

export function BriefSummaryCard({ summaryData, accent, flat }) {
  if (!summaryData) return null;
  const acc = accent || "#3b82f6";
  const outer = flat
    ? { paddingBottom: 28, marginBottom: 4 }
    : { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "32px 40px", marginBottom: 24 };

  return (
    <div style={outer}>
      {/* Key requirements */}
      {summaryData.key_requirements?.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>
            Key Requirements
          </div>
          {summaryData.key_requirements.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9 }}>
              <span style={{ fontSize: 12, color: acc, fontWeight: 700, minWidth: 16, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Risk flags + Meeting questions */}
      {(summaryData.risk_flags?.length > 0 || summaryData.meeting_questions?.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: summaryData.technical_stack?.length > 0 ? 22 : 0 }}>
          {summaryData.risk_flags?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>
                Risk Flags
              </div>
              {summaryData.risk_flags.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 9 }}>
                  <span style={{ fontSize: 13, flexShrink: 0, color: "#f59e0b" }}>!</span>
                  <span style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{r}</span>
                </div>
              ))}
            </div>
          )}
          {summaryData.meeting_questions?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>
                Ask in Meeting
              </div>
              {summaryData.meeting_questions.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 9 }}>
                  <span style={{ fontSize: 13, flexShrink: 0, color: acc }}>?</span>
                  <span style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Technical stack + Content gaps */}
      {(summaryData.technical_stack?.length > 0 || summaryData.content_gaps?.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, paddingTop: 18, borderTop: "1px solid #e2e8f0" }}>
          {summaryData.technical_stack?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>
                Recommended Stack
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {summaryData.technical_stack.map((t, i) => (
                  <span key={i} style={{ background: "#f1f5f9", color: "#334155", borderRadius: 4, padding: "5px 12px", fontSize: 12 }}>{t}</span>
                ))}
              </div>
            </div>
          )}
          {summaryData.content_gaps?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>
                Content Gaps
              </div>
              {summaryData.content_gaps.map((g, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#ef4444", flexShrink: 0 }}>-</span>
                  <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{g}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── BriefDisplay ─────────────────────────────────────────────────────────────

export function BriefDisplay({ brief, tags, accent }) {
  const acc = accent || "#3b82f6";
  const sections = parseBrief(brief);
  const secHead = {
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
    background: acc,
    padding: "7px 14px",
    marginBottom: 14,
    borderRadius: 3,
    display: "block",
  };

  return (
    <div>
      {sections.length === 0 && brief && (
        <pre style={{ fontSize: 14, lineHeight: 1.9, color: "#334155", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
          {brief}
        </pre>
      )}

      {sections.map((sec, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <div style={secHead}>{sec.heading}</div>
          {sec.paragraphs.map((p, j) => (
            <p key={j} style={{ fontSize: 15, lineHeight: 1.95, color: "#334155", marginBottom: 14, fontFamily: "Georgia,serif" }}>{p}</p>
          ))}
        </div>
      ))}

      <TagsSection tags={tags} acc={acc} />
    </div>
  );
}

// ─── PrintView ────────────────────────────────────────────────────────────────

export function PrintView({ brief, form, brand, tags, summaryData, onClose }) {
  const acc = brand?.accent || "#3b82f6";
  const sections = parseBrief(brief);
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const metaParts = [
    form?.contactName,
    form?.businessName,
    form?.budget,
    form?.projectType === "redesign" ? "Redesign" : "New site",
    form?.pageCount ? `~${form.pageCount} pages` : "",
  ].filter(Boolean);

  return (
    <div ref={overlayRef} className="print-overlay" style={{ position: "fixed", inset: 0, background: "#f1f5f9", zIndex: 900, overflowY: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        .print-page { max-width:760px; margin:0 auto; background:#fff; padding:56px 64px 72px; }
        .print-sec-head { font-size:15px; font-weight:600; color:#fff; background:${acc}; padding:7px 14px; margin-bottom:14px; border-radius:3px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .print-p { font-size:14px; line-height:1.95; color:#334155; font-family:Georgia,serif; margin-bottom:13px; }
        .print-section { page-break-inside:avoid; }
        .summary-page { page-break-after:always; }
        @media print {
          body * { visibility: hidden; }
          .print-overlay, .print-overlay * { visibility: visible; }
          .print-overlay { position: absolute !important; left: 0; top: 0; width: 100%; overflow:visible !important; height:auto !important; }
          html, body { overflow:visible !important; height:auto !important; }
          .no-print { display:none !important }
          body { -webkit-print-color-adjust:exact; print-color-adjust:exact }
        }
      `}</style>

      <div className="no-print" style={{ position: "sticky", top: 0, background: "#0f172a", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <span style={{ color: "#f8fafc", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>Print Preview</span>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { overlayRef.current?.scrollTo(0, 0); window.print(); }}
            style={{ background: acc, color: "#fff", border: "none", borderRadius: 4, padding: "8px 20px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
            Save as PDF
          </button>
          {onClose && (
            <button onClick={onClose}
              style={{ background: "none", border: "1px solid #475569", borderRadius: 4, padding: "8px 14px", color: "#94a3b8", fontSize: 11, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Close
            </button>
          )}
        </div>
      </div>

      <div className="print-page">
        <div className={summaryData ? "summary-page" : ""}>
          <div style={{ height: 3, background: acc, marginBottom: 22 }} />
          {brand?.logoUrl
            ? <img src={brand.logoUrl} alt={brand.studioName} style={{ maxHeight: 48, maxWidth: 160, objectFit: "contain", display: "block", marginBottom: 14 }} />
            : <div style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: acc, fontWeight: 600, marginBottom: 14 }}>{brand?.studioName || "Web Design Brief"}</div>
          }
          <div style={{ fontSize: 32, fontWeight: 600, color: "#0f172a", lineHeight: 1.1, marginBottom: 12 }}>Web Design Brief</div>
          <div style={{ borderTop: "1.5px solid #0f172a", marginBottom: 10 }} />
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.9, marginBottom: 12 }}>
            {metaParts.map((p, i) => i === 0
              ? <strong key={i} style={{ color: "#0f172a" }}>{p}</strong>
              : <span key={i}>&nbsp; | &nbsp;{p}</span>
            )}
          </div>
          <div style={{ borderTop: "1px solid #e2e8f0", marginBottom: 28 }} />

          {tags && (tags.keywords?.length > 0 || tags.techStack?.length > 0) && (
            <div style={{ marginBottom: 24 }}>
              {tags.keywords?.length > 0 && (
                <div style={{ display: "flex", gap: 14, marginBottom: 8 }}>
                  {tags.keywords.map((k, i) => (
                    <span key={i} style={{ fontSize: 9, color: acc, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>{k}</span>
                  ))}
                </div>
              )}
              {tags.techStack?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tags.techStack.map((t, i) => (
                    <span key={i} style={{ background: "#f1f5f9", color: "#334155", borderRadius: 4, padding: "4px 10px", fontSize: 11 }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {summaryData && <BriefSummaryCard summaryData={summaryData} accent={acc} flat />}
        </div>

        {sections.map((sec, i) => (
          <div key={i} className="print-section" style={{ marginBottom: 28 }}>
            <div className="print-sec-head">{sec.heading}</div>
            {sec.paragraphs.map((p, j) => <p key={j} className="print-p">{p}</p>)}
          </div>
        ))}

        <div style={{ marginTop: 36, paddingTop: 12, borderTop: "1px solid #e2e8f0", fontSize: 10, color: "#94a3b8", letterSpacing: "0.08em" }}>
          Generated by {brand?.studioName || "Web Design Brief Studio"}
        </div>
      </div>
    </div>
  );
}
