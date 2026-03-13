import { Modal } from "@/components/ui";
import { QuoteTable } from "./QuoteTable";
import type { Quote } from "@/lib/types";

interface QuoteModalProps {
  quote: Quote;
  businessName?: string;
  accent?: string;
  onClose: () => void;
}

export function QuoteModal({
  quote,
  businessName,
  accent,
  onClose,
}: QuoteModalProps) {
  return (
    <Modal open onClose={onClose} size="lg" printable>
      {/* Toolbar */}
      <div className="flex items-center justify-between h-12 px-5 bg-th-surface rounded-t-2xl no-print">
        <span className="text-th-muted text-[12px] font-medium">Project Quote</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => window.print()}
            className="h-8 px-3 rounded-lg text-[11px] font-medium text-th-muted hover:text-th-secondary hover:bg-th-surface-hover transition-all cursor-pointer"
          >
            Print
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

      {/* Content */}
      <div
        className="px-10 py-10"
        style={{
          background: "var(--th-bg)",
          borderRadius: "0 0 24px 24px",
        }}
      >
        {businessName && (
          <p className="text-[13px] text-th-muted mb-6">{businessName}</p>
        )}
        <QuoteTable quote={quote} accent={accent} />
      </div>
    </Modal>
  );
}
