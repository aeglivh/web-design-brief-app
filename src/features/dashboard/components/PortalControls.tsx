import { useState } from "react";
import { authFetch, API_BASE } from "@/lib/api";

const PORTAL_STATUSES = [
  { value: "intake_complete", label: "Intake Complete" },
  { value: "brief_published", label: "Brief Published" },
  { value: "quote_published", label: "Quote Published" },
  { value: "contract_published", label: "Contract Published" },
  { value: "contract_signed", label: "Contract Signed" },
  { value: "in_progress", label: "In Progress" },
  { value: "launch", label: "Launch Day" },
  { value: "complete", label: "Complete" },
];

interface ProjectPhase {
  phase: string;
  weeks: string;
  deliverable: string;
}

interface ContractStatus {
  designerSignedName: string | null;
  designerSignedAt: string | null;
  clientSignedName: string | null;
  clientSignedAt: string | null;
}

interface PortalControlsProps {
  briefId: string;
  slug: string;
  accent: string;
  initialValues: {
    portal_status?: string;
    brief_visible?: boolean;
    quote_visible?: boolean;
    contract_visible?: boolean;
    portal_paused?: boolean;
    deposit_url?: string;
    client_email?: string;
    project_phases?: ProjectPhase[];
  };
  contractStatus?: ContractStatus;
  onUpdate?: (fields: Record<string, unknown>) => void;
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  accent,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accent: string;
}) {
  return (
    <div className="flex items-start justify-between" style={{ padding: "12px 0" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="text-[13px] font-medium" style={{ color: "var(--th-text-secondary)" }}>
          {label}
        </p>
        {hint && (
          <p className="text-[11px]" style={{ color: "var(--th-text-muted)", marginTop: 2 }}>
            {hint}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative cursor-pointer"
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          border: "none",
          backgroundColor: checked ? accent : "var(--th-border)",
          transition: "background-color 0.2s",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "#fff",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
}

export function PortalControls({ briefId, slug, accent, initialValues, contractStatus, onUpdate }: PortalControlsProps) {
  const [portalStatus, setPortalStatus] = useState(initialValues.portal_status || "intake_complete");
  const [briefVisible, setBriefVisible] = useState(initialValues.brief_visible ?? false);
  const [quoteVisible, setQuoteVisible] = useState(initialValues.quote_visible ?? false);
  const [contractVisible, setContractVisible] = useState(initialValues.contract_visible ?? false);
  const [portalPaused, setPortalPaused] = useState(initialValues.portal_paused ?? false);
  const [depositUrl, setDepositUrl] = useState(initialValues.deposit_url || "");
  const [clientEmail, setClientEmail] = useState(initialValues.client_email || "");
  const [phases, setPhases] = useState<ProjectPhase[]>(initialValues.project_phases || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const updateField = async (fields: Record<string, unknown>) => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/briefs`, {
        method: "PUT",
        body: JSON.stringify({ id: briefId, ...fields }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onUpdate?.(fields);
      }
    } catch {
      setError("Network error");
    }
    setSaving(false);
  };

  const handleToggle = (field: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    updateField({ [field]: value });
  };

  const handleStatusSave = () => {
    updateField({ portal_status: portalStatus });
  };

  const handleDepositSave = () => {
    updateField({ deposit_url: depositUrl.trim() || null });
  };

  const addPhase = () => {
    setPhases([...phases, { phase: "", weeks: "", deliverable: "" }]);
  };

  const updatePhase = (index: number, field: keyof ProjectPhase, value: string) => {
    const updated = phases.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    setPhases(updated);
  };

  const removePhase = (index: number) => {
    const updated = phases.filter((_, i) => i !== index);
    setPhases(updated);
    updateField({ project_phases: updated });
  };

  const savePhases = () => {
    const cleaned = phases.filter((p) => p.phase.trim());
    setPhases(cleaned);
    updateField({ project_phases: cleaned });
  };

  const portalUrl = `${window.location.origin}/studio/${slug}/${briefId}`;

  return (
    <div>
      {/* View Client Portal link */}
      <a
        href={portalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center rounded-[16px] text-[12px] font-medium transition-all hover:opacity-80"
        style={{
          border: `1px solid ${accent}44`,
          backgroundColor: accent + "12",
          color: "var(--th-text)",
          padding: "12px 24px",
          marginBottom: 20,
          gap: 8,
          textDecoration: "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        View Client Portal
      </a>

      {/* Portal Status */}
      <div
        className="rounded-[16px]"
        style={{
          border: "1px solid var(--th-border-light)",
          background: "var(--th-surface)",
          padding: 24,
          marginBottom: 20,
        }}
      >
        <p
          className="text-[10px] font-medium uppercase"
          style={{ color: "var(--th-text-muted)", letterSpacing: "0.15em", marginBottom: 16 }}
        >
          Portal Status
        </p>
        <div className="flex" style={{ gap: 8 }}>
          <select
            value={portalStatus}
            onChange={(e) => setPortalStatus(e.target.value)}
            className="flex-1 rounded-xl border text-[13px] outline-none transition-colors"
            style={{
              padding: "10px 14px",
              borderColor: "var(--th-border)",
              backgroundColor: "var(--th-input-bg)",
              color: "var(--th-text)",
            }}
          >
            {PORTAL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleStatusSave}
            disabled={saving || portalStatus === initialValues.portal_status}
            className="rounded-xl text-[12px] font-medium cursor-pointer transition-all border hover:opacity-90 disabled:opacity-40"
            style={{
              padding: "10px 16px",
              backgroundColor: accent + "22",
              borderColor: accent + "44",
              color: "var(--th-text)",
            }}
          >
            Save
          </button>
        </div>
        <p className="text-[11px]" style={{ color: "var(--th-text-muted)", marginTop: 8 }}>
          Controls the progress stepper shown to the client on the portal.
        </p>
      </div>

      {/* Contract Signing Status */}
      {contractStatus && (contractStatus.designerSignedName || contractStatus.clientSignedName) && (
        <div
          className="rounded-[16px]"
          style={{
            border: "1px solid var(--th-border-light)",
            background: "var(--th-surface)",
            padding: 24,
            marginBottom: 20,
          }}
        >
          <p
            className="text-[10px] font-medium uppercase"
            style={{ color: "var(--th-text-muted)", letterSpacing: "0.15em", marginBottom: 16 }}
          >
            Contract Signatures
          </p>

          {contractStatus.designerSignedName && (
            <div className="flex items-center" style={{ gap: 8, padding: "8px 0" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[12px]" style={{ color: "var(--th-text-secondary)" }}>
                <strong style={{ fontWeight: 600 }}>You signed</strong>{" "}
                <span style={{ color: "var(--th-text-muted)" }}>
                  — {contractStatus.designerSignedName},{" "}
                  {contractStatus.designerSignedAt && new Date(contractStatus.designerSignedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </span>
            </div>
          )}

          {contractStatus.clientSignedName ? (
            <div className="flex items-center" style={{ gap: 8, padding: "8px 0" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[12px]" style={{ color: "var(--th-text-secondary)" }}>
                <strong style={{ fontWeight: 600 }}>Client signed</strong>{" "}
                <span style={{ color: "var(--th-text-muted)" }}>
                  — {contractStatus.clientSignedName},{" "}
                  {contractStatus.clientSignedAt && new Date(contractStatus.clientSignedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </span>
            </div>
          ) : contractStatus.designerSignedName ? (
            <div className="flex items-center" style={{ gap: 8, padding: "8px 0" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--th-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[12px]" style={{ color: "var(--th-text-muted)" }}>
                Waiting for client to counter-sign
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Client Email */}
      <div
        className="rounded-[16px]"
        style={{
          border: "1px solid var(--th-border-light)",
          background: "var(--th-surface)",
          padding: 24,
          marginBottom: 20,
        }}
      >
        <p
          className="text-[10px] font-medium uppercase"
          style={{ color: "var(--th-text-muted)", letterSpacing: "0.15em", marginBottom: 16 }}
        >
          Client Email
        </p>
        <div className="flex" style={{ gap: 8 }}>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@example.com"
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
            onClick={() => updateField({ client_email: clientEmail.trim() || null })}
            disabled={saving}
            className="rounded-xl text-[12px] font-medium cursor-pointer transition-all border hover:opacity-90 disabled:opacity-40"
            style={{
              padding: "10px 16px",
              backgroundColor: accent + "22",
              borderColor: accent + "44",
              color: "var(--th-text)",
            }}
          >
            Save
          </button>
        </div>
        <p className="text-[11px]" style={{ color: "var(--th-text-muted)", marginTop: 8 }}>
          Notifications (updates, contract ready) are sent to this address.
        </p>
      </div>

      {/* Visibility Toggles */}
      <div
        className="rounded-[16px]"
        style={{
          border: "1px solid var(--th-border-light)",
          background: "var(--th-surface)",
          padding: 24,
          marginBottom: 20,
        }}
      >
        <p
          className="text-[10px] font-medium uppercase"
          style={{ color: "var(--th-text-muted)", letterSpacing: "0.15em", marginBottom: 8 }}
        >
          Document Visibility
        </p>
        <Toggle
          label="Show Brief"
          hint="Make the generated brief visible on the client portal"
          checked={briefVisible}
          onChange={(v) => handleToggle("brief_visible", v, setBriefVisible)}
          accent={accent}
        />
        <div style={{ height: 1, backgroundColor: "var(--th-border-light)" }} />
        <Toggle
          label="Show Quote"
          hint="Make the quote visible on the client portal"
          checked={quoteVisible}
          onChange={(v) => handleToggle("quote_visible", v, setQuoteVisible)}
          accent={accent}
        />
        <div style={{ height: 1, backgroundColor: "var(--th-border-light)" }} />
        <Toggle
          label="Show Contract"
          hint="Make the contract visible for signing on the client portal"
          checked={contractVisible}
          onChange={(v) => handleToggle("contract_visible", v, setContractVisible)}
          accent={accent}
        />
        <div style={{ height: 1, backgroundColor: "var(--th-border-light)" }} />
        <Toggle
          label="Pause Portal"
          hint="Temporarily hide all portal content — shows a 'preparing' message"
          checked={portalPaused}
          onChange={(v) => handleToggle("portal_paused", v, setPortalPaused)}
          accent={accent}
        />
      </div>

      {/* Deposit URL */}
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
          Deposit Payment
        </p>
        <label className="text-[12px] font-medium" style={{ color: "var(--th-text-secondary)", display: "block", marginBottom: 6 }}>
          Stripe Payment Link
        </label>
        <div className="flex" style={{ gap: 8 }}>
          <input
            type="url"
            value={depositUrl}
            onChange={(e) => setDepositUrl(e.target.value)}
            placeholder="https://buy.stripe.com/..."
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
            onClick={handleDepositSave}
            disabled={saving}
            className="rounded-xl text-[12px] font-medium cursor-pointer transition-all border hover:opacity-90 disabled:opacity-40"
            style={{
              padding: "10px 16px",
              backgroundColor: accent + "22",
              borderColor: accent + "44",
              color: "var(--th-text)",
            }}
          >
            Save
          </button>
        </div>
        <p className="text-[11px]" style={{ color: "var(--th-text-muted)", marginTop: 8 }}>
          Client sees a "Pay deposit" button after signing the contract.
        </p>
      </div>

      {/* Project Phases */}
      <div
        className="rounded-[16px]"
        style={{
          border: "1px solid var(--th-border-light)",
          background: "var(--th-surface)",
          padding: 24,
          marginTop: 20,
        }}
      >
        <p
          className="text-[10px] font-medium uppercase"
          style={{ color: "var(--th-text-muted)", letterSpacing: "0.15em", marginBottom: 16 }}
        >
          Project Timeline
        </p>
        <p className="text-[11px]" style={{ color: "var(--th-text-muted)", marginBottom: 16 }}>
          Define the project phases shown on the client portal timeline.
        </p>

        {phases.map((phase, i) => (
          <div
            key={i}
            style={{
              border: "1px solid var(--th-border-light)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              backgroundColor: "var(--th-surface-hover)",
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <span className="text-[11px] font-medium" style={{ color: "var(--th-text-muted)" }}>
                Phase {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removePhase(i)}
                className="text-[11px] cursor-pointer"
                style={{ color: "var(--th-text-muted)", background: "none", border: "none", padding: "2px 6px" }}
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              value={phase.phase}
              onChange={(e) => updatePhase(i, "phase", e.target.value)}
              placeholder="Phase name (e.g. Discovery & Strategy)"
              className="w-full rounded-lg border text-[13px] outline-none"
              style={{
                padding: "8px 12px",
                borderColor: "var(--th-border)",
                backgroundColor: "var(--th-input-bg)",
                color: "var(--th-text)",
                marginBottom: 8,
              }}
            />
            <div className="flex" style={{ gap: 8 }}>
              <input
                type="text"
                value={phase.weeks}
                onChange={(e) => updatePhase(i, "weeks", e.target.value)}
                placeholder="Week 1-2"
                className="rounded-lg border text-[12px] outline-none"
                style={{
                  padding: "8px 12px",
                  borderColor: "var(--th-border)",
                  backgroundColor: "var(--th-input-bg)",
                  color: "var(--th-text)",
                  width: 120,
                  flexShrink: 0,
                }}
              />
              <input
                type="text"
                value={phase.deliverable}
                onChange={(e) => updatePhase(i, "deliverable", e.target.value)}
                placeholder="Deliverable (e.g. Sitemap, wireframes)"
                className="flex-1 rounded-lg border text-[12px] outline-none"
                style={{
                  padding: "8px 12px",
                  borderColor: "var(--th-border)",
                  backgroundColor: "var(--th-input-bg)",
                  color: "var(--th-text)",
                }}
              />
            </div>
          </div>
        ))}

        <div className="flex" style={{ gap: 8 }}>
          <button
            type="button"
            onClick={addPhase}
            className="rounded-xl text-[12px] font-medium cursor-pointer transition-all border hover:opacity-90"
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              borderColor: "var(--th-border)",
              color: "var(--th-text-secondary)",
            }}
          >
            + Add phase
          </button>
          {phases.length > 0 && (
            <button
              type="button"
              onClick={savePhases}
              disabled={saving}
              className="rounded-xl text-[12px] font-medium cursor-pointer transition-all border hover:opacity-90 disabled:opacity-40"
              style={{
                padding: "8px 16px",
                backgroundColor: accent + "22",
                borderColor: accent + "44",
                color: "var(--th-text)",
              }}
            >
              Save phases
            </button>
          )}
        </div>
      </div>

      {/* Dev: Reset for testing */}
      <div
        className="rounded-[16px]"
        style={{
          border: "1px dashed var(--th-border)",
          background: "transparent",
          padding: 20,
          marginTop: 20,
          opacity: 0.6,
        }}
      >
        <p
          className="text-[10px] font-medium uppercase"
          style={{ color: "var(--th-text-muted)", letterSpacing: "0.15em", marginBottom: 10 }}
        >
          Dev Tools
        </p>
        <button
          type="button"
          onClick={async () => {
            console.log("[PortalControls] Reset clicked, briefId:", briefId);
            const result = await updateField({
              portal_status: "contract_published",
              contract_visible: true,
              _reset_signing: true,
            });
            console.log("[PortalControls] Reset result:", result);
            setPortalStatus("contract_published");
            setContractVisible(true);
          }}
          className="rounded-xl text-[11px] font-medium cursor-pointer transition-all border hover:opacity-80"
          style={{
            padding: "8px 14px",
            backgroundColor: "rgba(239,68,68,0.08)",
            borderColor: "rgba(239,68,68,0.2)",
            color: "#ef4444",
          }}
        >
          Reset to "Contract Published" (clear signature)
        </button>
        <p className="text-[10px]" style={{ color: "var(--th-text-muted)", marginTop: 6 }}>
          Resets portal status &amp; clears signature so you can re-test the client signing flow.
        </p>
      </div>

      {/* Status feedback */}
      {(saving || saved || error) && (
        <div style={{ marginTop: 12, textAlign: "center" }}>
          {saving && <p className="text-[11px]" style={{ color: "var(--th-text-muted)" }}>Saving...</p>}
          {saved && <p className="text-[11px]" style={{ color: "#22c55e" }}>Saved</p>}
          {error && <p className="text-[11px]" style={{ color: "#ef4444" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
