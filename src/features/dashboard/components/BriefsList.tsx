import { useState } from "react";
import { Button, EmptyState } from "@/components/ui";
import { BriefCard } from "./BriefCard";
import type { Brief } from "@/lib/types";

interface BriefsListProps {
  briefs: Brief[];
  accent: string;
  slug?: string;
  onSelect: (brief: Brief) => void;
  onDelete: (id: string) => void;
  onCopyLink: () => void;
  copied: boolean;
}

export function BriefsList({
  briefs,
  accent,
  onSelect,
  onDelete,
  onCopyLink,
  copied,
}: BriefsListProps) {
  const [search, setSearch] = useState("");

  const filtered = briefs.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (b.business_name || "").toLowerCase().includes(q) ||
      (b.client_name || "").toLowerCase().includes(q) ||
      (b.industry || "").toLowerCase().includes(q) ||
      (b.client_email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-light tracking-[-0.02em] text-th-text">
            Client Briefs
          </h2>
          {briefs.length > 0 && (
            <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-th-surface-hover font-mono text-[11px] font-medium text-th-muted tabular-nums">
              {briefs.length}
            </span>
          )}
        </div>
        {briefs.length > 3 && (
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-th-muted pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search briefs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border border-th-border bg-th-surface pl-10 pr-4 text-[13px] text-th-text outline-none focus:border-th-border focus:ring-[3px] focus:ring-th-surface-hover w-56 transition-all duration-200 placeholder:text-th-placeholder"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {filtered.length === 0 && briefs.length === 0 ? (
        <EmptyState
          title="No briefs yet"
          description="Share your client form link and briefs will appear here once submitted."
          action={
            <Button accent={accent} onClick={onCopyLink}>
              {copied ? "Copied!" : "Copy Client Link"}
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[14px] text-th-muted">
            No briefs matching "<span className="text-th-secondary">{search}</span>"
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((b) => (
            <BriefCard
              key={b.id}
              brief={b}
              accent={accent}
              onClick={() => onSelect(b)}
              onDelete={(e) => {
                e.stopPropagation();
                if (window.confirm("Delete this brief?")) onDelete(b.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
