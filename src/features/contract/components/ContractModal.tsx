import { useState, useRef, useCallback } from "react";
import { Modal } from "@/components/ui";
import { ContractDocument } from "./ContractDocument";
import { buildContractHtml, downloadPdf } from "@/lib/downloadPdf";
import type { ContractData } from "@/lib/types";

const FONT_SIZES = [12, 13, 14, 15, 16] as const;

interface ContractModalProps {
  contractId: string;
  data: ContractData;
  studioName: string;
  clientName: string;
  businessName: string;
  currency: string;
  accent: string;
  onSave: (contractId: string, data: ContractData) => Promise<boolean>;
  onSign: (contractId: string, signedName: string) => Promise<boolean>;
  saving: boolean;
  designerSignedName?: string | null;
  designerSignedAt?: string | null;
  onClose: () => void;
}

export function ContractModal({
  contractId,
  data: initialData,
  studioName,
  clientName,
  businessName,
  currency,
  accent,
  onSave,
  onSign,
  saving,
  designerSignedName,
  designerSignedAt,
  onClose,
}: ContractModalProps) {
  const [data, setData] = useState<ContractData>(initialData);
  const [dirty, setDirty] = useState(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const dataRef = useRef(data);
  const [signName, setSignName] = useState(studioName || "");
  const [signed, setSigned] = useState(!!designerSignedName);
  const [signing, setSigning] = useState(false);

  const handleChange = useCallback((updated: ContractData) => {
    setData(updated);
    dataRef.current = updated;
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!dirty) return;
    const ok = await onSave(contractId, dataRef.current);
    if (ok) setDirty(false);
  }, [dirty, onSave, contractId]);

  const handleClose = useCallback(async () => {
    if (dirty) {
      await onSave(contractId, dataRef.current);
    }
    onClose();
  }, [dirty, onSave, contractId, onClose]);

  return (
    <Modal open onClose={handleClose} size="xl" printable>
      {/* Toolbar */}
      <div className="flex items-center justify-between h-12 px-5 bg-th-surface rounded-t-2xl no-print">
        <span className="text-th-muted text-[12px] font-medium">
          Project Contract
          <span className="text-th-muted/50 ml-2">— click any text to edit</span>
        </span>
        <div className="flex items-center gap-1.5">
          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-8 px-3 rounded-lg text-[11px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5"
              style={{
                backgroundColor: "rgba(16,185,129,0.1)",
                color: "#059669",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
          {!dirty && (
            <span className="text-[11px] text-th-muted/50">Saved</span>
          )}
          <div className="w-px h-4 bg-th-border mx-0.5" />
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setFontSize((s) => Math.max(FONT_SIZES[0], s - 1))}
              disabled={fontSize <= FONT_SIZES[0]}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-th-muted hover:text-th-secondary hover:bg-th-surface-hover transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
              title="Decrease font size"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <span className="text-[11px] text-th-muted tabular-nums w-8 text-center">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(FONT_SIZES[FONT_SIZES.length - 1], s + 1))}
              disabled={fontSize >= FONT_SIZES[FONT_SIZES.length - 1]}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-th-muted hover:text-th-secondary hover:bg-th-surface-hover transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
              title="Increase font size"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
          <div className="w-px h-4 bg-th-border mx-0.5" />
          <button
            onClick={async () => {
              const html = buildContractHtml({
                studioName,
                clientName,
                businessName,
                currency,
                accent,
                data: dataRef.current as unknown as Record<string, unknown>,
                designerSignature: {
                  name: designerSignedName || (signed ? signName : null),
                  date: designerSignedAt || (signed ? new Date().toISOString() : null),
                },
              });
              await downloadPdf(html, `Contract — ${businessName || clientName}.pdf`);
            }}
            className="h-8 px-3 rounded-lg text-[11px] font-medium text-th-muted hover:text-th-secondary hover:bg-th-surface-hover transition-all cursor-pointer"
          >
            Download Contract
          </button>
          <div className="w-px h-4 bg-th-border mx-0.5" />
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-th-muted hover:text-th-secondary hover:bg-th-surface-hover transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* AI disclaimer */}
      <div
        className="no-print"
        style={{
          padding: "8px 20px",
          backgroundColor: "rgba(251,191,36,0.08)",
          borderBottom: "1px solid rgba(251,191,36,0.15)",
        }}
      >
        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: "#92400e" }}>
          This contract was AI-generated as a starting point. Review and edit it to comply with your local laws before sharing with your client. debrieft assumes no legal liability.
        </p>
      </div>

      {/* Document */}
      <div
        className="overflow-y-auto max-h-[80vh] print-flatten"
        style={{
          background: "#ffffff",
          borderRadius: "0 0 24px 24px",
        }}
      >
        <div style={{ padding: "48px 56px" }}>
          <ContractDocument
            data={data}
            onChange={handleChange}
            studioName={studioName}
            clientName={clientName}
            businessName={businessName}
            currency={currency}
            accent={accent}
            fontSize={fontSize}
            designerSignature={{
              name: designerSignedName || (signed ? signName : null),
              date: designerSignedAt || (signed ? new Date().toISOString() : null),
            }}
          />

          {/* Designer Signature Section */}
          <div
            className="no-print"
            style={{
              marginTop: 40,
              padding: 24,
              borderRadius: 16,
              border: signed
                ? "1px solid rgba(34,197,94,0.3)"
                : `1px solid ${accent}33`,
              backgroundColor: signed
                ? "rgba(34,197,94,0.06)"
                : `${accent}08`,
            }}
          >
            {signed ? (
              <>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>
                    You signed this contract
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                  Signed by {designerSignedName || signName} on{" "}
                  {designerSignedAt
                    ? new Date(designerSignedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                  You can now share this contract with your client via the Portal tab.
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>
                  Sign this contract
                </p>
                <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
                  Your signature will appear on the contract before it's sent to the client for counter-signing.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    placeholder="Your full name or studio name"
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #e0e0e0",
                      fontSize: 13,
                      color: "#333",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    disabled={!signName.trim() || signing || saving}
                    onClick={async () => {
                      setSigning(true);
                      // Save any pending edits first
                      if (dirty) await onSave(contractId, dataRef.current);
                      const ok = await onSign(contractId, signName.trim());
                      if (ok) {
                        setSigned(true);
                        setDirty(false);
                      }
                      setSigning(false);
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 12,
                      border: "none",
                      backgroundColor: accent,
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: signName.trim() ? "pointer" : "not-allowed",
                      opacity: !signName.trim() || signing ? 0.5 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {signing ? "Signing..." : "Sign Contract"}
                  </button>
                </div>
                <p style={{ fontSize: 10, color: "#999", marginTop: 8 }}>
                  By signing, you confirm this contract is ready to be shared with your client.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
