import { useState } from "react";
import { parseBrief } from "@/features/brief/lib/parseBrief";
import { API_BASE } from "@/lib/api";
import { buildContractHtml, downloadPdf } from "@/lib/downloadPdf";
import type { PortalBrief, PortalContract } from "./usePortalData";

interface PortalDocumentsProps {
  brief: PortalBrief;
  contract: PortalContract | null;
  accent: string;
  studioName: string;
  onSigned?: () => void;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.2s",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DocCard({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-[16px]"
      style={{
        border: "1px solid var(--th-border-light)",
        background: "var(--th-surface)",
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between cursor-pointer bg-transparent border-0"
        style={{ padding: "16px 24px", color: "var(--th-text)" }}
      >
        <div className="flex items-center" style={{ gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: accent,
              flexShrink: 0,
            }}
          />
          <span className="text-[13px] font-semibold">{title}</span>
        </div>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div style={{ padding: "0 40px 24px" }}>
          <div
            style={{
              borderTop: "1px solid var(--th-border-light)",
              paddingTop: 20,
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Brief Section ── */
function BriefContent({ briefText, accent }: { briefText: string; accent: string }) {
  const sections = parseBrief(briefText);

  if (sections.length === 0 && briefText) {
    return (
      <pre
        className="text-[13px] leading-relaxed"
        style={{
          color: "var(--th-text-secondary)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          margin: 0,
        }}
      >
        {briefText}
      </pre>
    );
  }

  return (
    <div>
      {sections.map((sec, i) => (
        <div key={i} style={{ marginBottom: i < sections.length - 1 ? 20 : 0 }}>
          <p
            className="text-[12px] font-semibold uppercase"
            style={{
              color: accent,
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            {sec.heading}
          </p>
          {sec.bullets.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 16, listStyle: "none" }}>
              {sec.bullets.map((b, j) => (
                <li
                  key={j}
                  className="text-[13px] leading-relaxed"
                  style={{
                    color: "var(--th-text-secondary)",
                    marginBottom: 4,
                    position: "relative",
                    paddingLeft: 12,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      color: accent,
                      fontWeight: 600,
                    }}
                  >
                    &bull;
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}
          {sec.paragraphs.map((p, j) => (
            <p
              key={j}
              className="text-[13px] leading-relaxed"
              style={{ color: "var(--th-text-secondary)", marginBottom: 6 }}
            >
              {p}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Quote Section ── */
interface QuoteData {
  lineItems?: { item: string; quantity: number; unitPrice: number; total: number }[];
  subtotal?: number;
  complexityLevel?: string;
  complexityMultiplier?: number;
  total?: number;
  currency?: string;
  notes?: string;
  estimatedHours?: number;
}

function QuoteContent({ quote }: { quote: QuoteData }) {
  const currency = quote.currency || "CHF";
  const fmt = (n: number) =>
    `${currency} ${n.toLocaleString("de-CH", { minimumFractionDigits: 0 })}`;

  return (
    <div>
      {/* Line items */}
      {quote.lineItems && quote.lineItems.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Item", "Qty", "Unit Price", "Total"].map((h) => (
                  <th
                    key={h}
                    className="text-[11px] font-medium uppercase"
                    style={{
                      color: "var(--th-text-muted)",
                      letterSpacing: "0.08em",
                      padding: "8px 10px",
                      borderBottom: "1px solid var(--th-border-light)",
                      textAlign: h === "Item" ? "left" : "right",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((li, i) => (
                <tr key={i}>
                  <td
                    className="text-[13px]"
                    style={{
                      color: "var(--th-text)",
                      padding: "10px 10px",
                      borderBottom: "1px solid var(--th-border-light)",
                    }}
                  >
                    {li.item}
                  </td>
                  <td
                    className="text-[13px] font-mono"
                    style={{
                      color: "var(--th-text-secondary)",
                      padding: "10px 10px",
                      borderBottom: "1px solid var(--th-border-light)",
                      textAlign: "right",
                    }}
                  >
                    {li.quantity}
                  </td>
                  <td
                    className="text-[13px] font-mono"
                    style={{
                      color: "var(--th-text-secondary)",
                      padding: "10px 10px",
                      borderBottom: "1px solid var(--th-border-light)",
                      textAlign: "right",
                    }}
                  >
                    {fmt(li.unitPrice)}
                  </td>
                  <td
                    className="text-[13px] font-mono"
                    style={{
                      color: "var(--th-text)",
                      padding: "10px 10px",
                      borderBottom: "1px solid var(--th-border-light)",
                      textAlign: "right",
                      fontWeight: 500,
                    }}
                  >
                    {fmt(li.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      <div style={{ marginTop: 16 }}>
        {quote.subtotal != null && quote.complexityMultiplier && quote.complexityMultiplier !== 1 && (
          <>
            <div className="flex justify-between text-[12px]" style={{ padding: "4px 0", color: "var(--th-text-secondary)" }}>
              <span>Subtotal</span>
              <span className="font-mono">{fmt(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[12px]" style={{ padding: "4px 0", color: "var(--th-text-secondary)" }}>
              <span>Complexity: {quote.complexityLevel} ({quote.complexityMultiplier}x)</span>
              <span />
            </div>
          </>
        )}
        {quote.total != null && (
          <div
            className="flex justify-between text-[15px] font-semibold"
            style={{
              padding: "10px 0 0",
              borderTop: "1px solid var(--th-border-light)",
              marginTop: 8,
              color: "var(--th-text)",
            }}
          >
            <span>Total</span>
            <span className="font-mono">{fmt(quote.total)}</span>
          </div>
        )}
        {quote.estimatedHours != null && (
          <p className="text-[11px]" style={{ color: "var(--th-text-muted)", marginTop: 6 }}>
            Estimated hours: {quote.estimatedHours}h
          </p>
        )}
      </div>

      {/* Notes */}
      {quote.notes && (
        <div
          className="rounded-lg text-[12px] leading-relaxed"
          style={{
            marginTop: 14,
            padding: "10px 14px",
            backgroundColor: "var(--th-surface-hover)",
            color: "var(--th-text-secondary)",
          }}
        >
          {quote.notes}
        </div>
      )}
    </div>
  );
}

/* ── Contract Section ── */
interface ContractData {
  scopeOfWork?: string;
  deliverables?: { item: string; description: string }[];
  exclusions?: string[];
  revisionPolicy?: {
    designRevisions?: number;
    developmentRevisions?: number;
    additionalRate?: number;
    description?: string;
  };
  timeline?: {
    totalWeeks?: number;
    milestones?: { phase: string; weeks: string; deliverable: string }[];
  };
  paymentSchedule?: { milestone: string; percentage: number; amount: number }[];
  changeRequestProcess?: string;
  ipTransfer?: string;
  cancellationTerms?: string;
  warranty?: string;
}

function ContractContent({ data, accent }: { data: ContractData; accent: string }) {
  const sections: { title: string; content: React.ReactNode }[] = [];

  if (data.scopeOfWork) {
    sections.push({
      title: "Scope of Work",
      content: (
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--th-text-secondary)" }}>
          {data.scopeOfWork}
        </p>
      ),
    });
  }

  if (data.deliverables?.length) {
    sections.push({
      title: "Deliverables",
      content: (
        <ul style={{ margin: 0, paddingLeft: 16, listStyle: "none" }}>
          {data.deliverables.map((d, i) => (
            <li
              key={i}
              className="text-[13px] leading-relaxed"
              style={{
                color: "var(--th-text-secondary)",
                marginBottom: 6,
                paddingLeft: 12,
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  color: accent,
                  fontWeight: 600,
                }}
              >
                &bull;
              </span>
              <span className="font-medium" style={{ color: "var(--th-text)" }}>
                {d.item}
              </span>
              {d.description && (
                <p className="text-[12px]" style={{ color: "var(--th-text-muted)", margin: "2px 0 0" }}>
                  {d.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (data.exclusions?.length) {
    sections.push({
      title: "Exclusions",
      content: (
        <ul style={{ margin: 0, paddingLeft: 16, listStyle: "none" }}>
          {data.exclusions.map((e, i) => (
            <li
              key={i}
              className="text-[13px] leading-relaxed"
              style={{ color: "var(--th-text-secondary)", marginBottom: 4, paddingLeft: 12, position: "relative" }}
            >
              <span style={{ position: "absolute", left: 0, color: "var(--th-text-muted)" }}>&bull;</span>
              {e}
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (data.revisionPolicy) {
    const rp = data.revisionPolicy;
    sections.push({
      title: "Revision Policy",
      content: (
        <div className="text-[13px] leading-relaxed" style={{ color: "var(--th-text-secondary)" }}>
          {rp.designRevisions != null && <p style={{ marginBottom: 4 }}>Design revisions: {rp.designRevisions}</p>}
          {rp.developmentRevisions != null && <p style={{ marginBottom: 4 }}>Development revisions: {rp.developmentRevisions}</p>}
          {rp.additionalRate != null && <p style={{ marginBottom: 4 }}>Additional revision rate: {rp.additionalRate}/hr</p>}
          {rp.description && <p>{rp.description}</p>}
        </div>
      ),
    });
  }

  if (data.timeline?.milestones?.length) {
    sections.push({
      title: `Timeline (${data.timeline.totalWeeks || "—"} weeks)`,
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.timeline.milestones.map((m, i) => (
            <div key={i} className="flex items-start" style={{ gap: 10 }}>
              <span
                className="text-[11px] font-mono font-medium"
                style={{
                  color: accent,
                  minWidth: 50,
                  flexShrink: 0,
                }}
              >
                {m.weeks}w
              </span>
              <div>
                <span className="text-[13px] font-medium" style={{ color: "var(--th-text)" }}>
                  {m.phase}
                </span>
                <p className="text-[12px]" style={{ color: "var(--th-text-muted)", marginTop: 2 }}>
                  {m.deliverable}
                </p>
              </div>
            </div>
          ))}
        </div>
      ),
    });
  }

  if (data.paymentSchedule?.length) {
    sections.push({
      title: "Payment Schedule",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.paymentSchedule.map((p, i) => (
            <div key={i} className="flex justify-between items-center text-[13px]">
              <span style={{ color: "var(--th-text-secondary)" }}>
                {p.milestone} ({p.percentage}%)
              </span>
              <span className="font-mono font-medium" style={{ color: "var(--th-text)" }}>
                {p.amount.toLocaleString("de-CH")}
              </span>
            </div>
          ))}
        </div>
      ),
    });
  }

  const textSections = [
    { key: "changeRequestProcess", title: "Change Requests" },
    { key: "ipTransfer", title: "Intellectual Property" },
    { key: "cancellationTerms", title: "Cancellation Terms" },
    { key: "warranty", title: "Warranty" },
  ] as const;

  for (const { key, title } of textSections) {
    if (data[key]) {
      sections.push({
        title,
        content: (
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--th-text-secondary)" }}>
            {data[key]}
          </p>
        ),
      });
    }
  }

  return (
    <div>
      {sections.map((sec, i) => (
        <div key={i} style={{ marginBottom: i < sections.length - 1 ? 20 : 0 }}>
          <p
            className="text-[12px] font-semibold uppercase"
            style={{
              color: accent,
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            {sec.title}
          </p>
          {sec.content}
        </div>
      ))}
    </div>
  );
}

/* ── Contract Signing ── */
function ContractSignature({
  briefId,
  signedAt,
  signedName,
  designerSignedName,
  designerSignedAt,
  accent,
  onSigned,
}: {
  briefId: string;
  signedAt: string | null;
  signedName: string | null;
  designerSignedName?: string | null;
  designerSignedAt?: string | null;
  accent: string;
  onSigned?: () => void;
}) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [justSigned, setJustSigned] = useState(false);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const handleSign = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/portal-sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief_id: briefId, signed_name: name.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setJustSigned(true);
        onSigned?.();
      } else {
        setError(data.error || "Failed to sign");
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: 20 }}>
      {/* Designer Signature (always shown if designer has signed) */}
      {designerSignedName && designerSignedAt && (
        <div
          className="rounded-xl"
          style={{
            padding: 16,
            marginBottom: 12,
            border: "1px solid rgba(34,197,94,0.3)",
            backgroundColor: "rgba(34,197,94,0.06)",
          }}
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[13px] font-medium" style={{ color: "#4ade80" }}>
              Signed by designer
            </span>
          </div>
          <p className="text-[12px]" style={{ color: "var(--th-text-muted)", marginTop: 6 }}>
            {designerSignedName} — {formatDate(designerSignedAt)}
          </p>
        </div>
      )}

      {/* Client Signature */}
      {signedAt || justSigned ? (
        <div
          className="rounded-xl"
          style={{
            padding: 16,
            border: "1px solid rgba(34,197,94,0.3)",
            backgroundColor: "rgba(34,197,94,0.08)",
          }}
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[13px] font-medium" style={{ color: "#4ade80" }}>
              Contract signed
            </span>
          </div>
          <p className="text-[12px]" style={{ color: "var(--th-text-muted)", marginTop: 6 }}>
            Signed by {justSigned ? name : signedName} on{" "}
            {justSigned
              ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : formatDate(signedAt!)}
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl"
          style={{
            padding: 16,
            border: "1px solid var(--th-border-light)",
            backgroundColor: "var(--th-surface-hover)",
          }}
        >
          <p className="text-[12px] font-medium" style={{ color: "var(--th-text-secondary)", marginBottom: 10 }}>
            By typing your full name below and clicking "Sign Contract", you agree to the terms outlined above.
          </p>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-lg border text-[13px] outline-none"
            style={{
              padding: "10px 14px",
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
            onClick={handleSign}
            disabled={!name.trim() || submitting}
            className="w-full rounded-full text-[13px] font-semibold cursor-pointer transition-all border hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              padding: "10px 0",
              backgroundColor: accent,
              borderColor: accent,
              color: "#fff",
            }}
          >
            {submitting ? "Signing..." : "Sign Contract"}
          </button>

          <p
            className="text-[10px] leading-relaxed"
            style={{ color: "var(--th-text-muted)", marginTop: 10, opacity: 0.7 }}
          >
            By typing your full name and clicking "Sign Contract", you are providing a valid electronic signature
            in accordance with the eIDAS Regulation (EU) and the ESIGN Act (US). Your name, timestamp, and IP
            address are recorded as proof of agreement.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Main Export ── */
export function PortalDocuments({ brief, contract, accent, studioName, onSigned }: PortalDocumentsProps) {
  const hasAny = brief.brief_visible || brief.quote_visible || brief.contract_visible;
  if (!hasAny) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      {brief.brief_visible && brief.brief_text && (
        <DocCard title="Project Brief" accent={accent}>
          <BriefContent briefText={brief.brief_text} accent={accent} />
        </DocCard>
      )}

      {brief.quote_visible && brief.quote && (
        <DocCard title="Quote" accent={accent}>
          <QuoteContent quote={brief.quote as unknown as QuoteData} />
        </DocCard>
      )}

      {brief.contract_visible && contract?.contract_data && (
        <DocCard title={brief.signed_at ? "Contract (Signed)" : "Contract"} accent={accent}>
          <ContractContent data={contract.contract_data as unknown as ContractData} accent={accent} />
          <ContractSignature
            briefId={brief.id}
            signedAt={brief.signed_at}
            signedName={brief.signed_name}
            designerSignedName={contract.designer_signed_name}
            designerSignedAt={contract.designer_signed_at}
            accent={accent}
            onSigned={onSigned}
          />
          <button
            type="button"
            onClick={async () => {
              const html = buildContractHtml({
                studioName,
                clientName: brief.client_name,
                businessName: brief.business_name,
                accent,
                data: contract.contract_data,
                designerSignature: contract.designer_signed_name
                  ? { name: contract.designer_signed_name, date: contract.designer_signed_at || null }
                  : undefined,
                clientSignature: brief.signed_name
                  ? { name: brief.signed_name, date: brief.signed_at }
                  : undefined,
              });
              await downloadPdf(html, `Contract — ${brief.business_name || brief.client_name}.pdf`);
            }}
            className="w-full rounded-xl text-[12px] font-medium cursor-pointer transition-all hover:opacity-80"
            style={{
              marginTop: 16,
              padding: "10px 0",
              backgroundColor: "var(--th-surface-hover)",
              border: "1px solid var(--th-border-light)",
              color: "var(--th-text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Contract (PDF)
          </button>
        </DocCard>
      )}
    </div>
  );
}
