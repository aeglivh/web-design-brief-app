import { Modal, Button } from "@/components/ui";
import { ContractDocument } from "./ContractDocument";
import type { ContractData } from "@/lib/types";

interface ContractModalProps {
  data: ContractData;
  studioName: string;
  clientName: string;
  businessName: string;
  currency: string;
  accent: string;
  onClose: () => void;
}

export function ContractModal({
  data,
  studioName,
  clientName,
  businessName,
  currency,
  accent,
  onClose,
}: ContractModalProps) {
  return (
    <Modal open onClose={onClose} size="xl" printable>
      {/* Toolbar */}
      <div className="flex items-center justify-between h-12 px-5 bg-th-surface rounded-t-2xl no-print">
        <span className="text-th-muted text-[12px] font-medium">Project Contract</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => window.print()}
            className="h-8 px-3 rounded-lg text-[11px] font-medium text-th-muted hover:text-th-secondary hover:bg-th-surface-hover transition-all cursor-pointer"
          >
            Print / PDF
          </button>
          <div className="w-px h-4 bg-th-border mx-0.5" />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-th-muted hover:text-th-secondary hover:bg-th-surface-hover transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Document */}
      <div
        className="px-10 py-10 overflow-y-auto max-h-[75vh] print-flatten"
        style={{
          background: "var(--th-bg)",
          borderRadius: "0 0 24px 24px",
        }}
      >
        <ContractDocument
          data={data}
          studioName={studioName}
          clientName={clientName}
          businessName={businessName}
          currency={currency}
          accent={accent}
        />
      </div>
    </Modal>
  );
}
