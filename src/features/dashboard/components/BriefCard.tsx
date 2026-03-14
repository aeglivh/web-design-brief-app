import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Brief } from "@/lib/types";

interface BriefCardProps {
  brief: Brief;
  accent: string;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function BriefCard({ brief, accent, onClick, onDelete }: BriefCardProps) {
  const initials = (brief.client_name || brief.business_name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 px-4 py-4 bg-th-surface border border-th-border-light hover:border-th-border hover:bg-th-surface-hover rounded-[16px] cursor-pointer transition-all duration-200 ease-out"
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-bold text-th-text shrink-0"
        style={{ backgroundColor: accent }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-[14px] font-medium text-th-text truncate">
            {brief.business_name || brief.client_name || "Unnamed"}
          </span>
          {brief.quote && <Badge variant="success">Quoted</Badge>}
        </div>
        <div className="text-[12px] text-th-secondary truncate leading-relaxed">
          {[
            brief.industry,
            brief.project_type === "redesign" ? "Redesign" : brief.project_type === "new" ? "New site" : null,
            brief.budget,
            brief.client_email,
          ]
            .filter(Boolean)
            .join(" \u00B7 ")}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="font-mono text-[10px] text-th-muted tabular-nums">
          {formatDate(brief.created_at)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(e); }}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-th-muted hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-all duration-200 cursor-pointer"
          aria-label="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
        <svg className="text-th-muted group-hover:text-th-secondary transition-colors duration-200" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}
