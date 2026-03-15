import { useState, useRef, useCallback } from "react";
import { Modal } from "@/components/ui";
import { ContractDocument } from "./ContractDocument";
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
  saving: boolean;
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
  saving,
  onClose,
}: ContractModalProps) {
  const [data, setData] = useState<ContractData>(initialData);
  const [dirty, setDirty] = useState(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const dataRef = useRef(data);

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
            onClick={() => window.print()}
            className="h-8 px-3 rounded-lg text-[11px] font-medium text-th-muted hover:text-th-secondary hover:bg-th-surface-hover transition-all cursor-pointer"
          >
            Print / PDF
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
          />
        </div>
      </div>
    </Modal>
  );
}
