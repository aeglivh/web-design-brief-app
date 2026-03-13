import { cn } from "@/lib/cn";

interface SummaryData {
  key_requirements?: string[];
  technical_stack?: string[];
  content_gaps?: string[];
  risk_flags?: string[];
  meeting_questions?: string[];
}

interface BriefSummaryCardProps {
  summaryData: SummaryData | null;
  accent?: string;
  flat?: boolean;
}

export function BriefSummaryCard({
  summaryData,
  accent,
  flat,
}: BriefSummaryCardProps) {
  if (!summaryData) return null;
  const acc = accent || "#3b82f6";

  return (
    <div
      className={cn(
        flat
          ? "pb-7 mb-1"
          : "bg-th-surface border border-th-border rounded-[12px] p-8 px-10 mb-6"
      )}
    >
      {/* Key requirements */}
      {(summaryData.key_requirements?.length ?? 0) > 0 && (
        <div className="mb-5.5">
          <div className="text-[13px] font-medium text-th-text mb-3">
            Key Requirements
          </div>
          {summaryData.key_requirements!.map((r, i) => (
            <div key={i} className="flex gap-2.5 mb-2">
              <span
                className="text-xs font-bold min-w-4 shrink-0"
                style={{ color: acc }}
              >
                {i + 1}
              </span>
              <span className="text-sm text-th-secondary leading-relaxed">{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Risk flags + Meeting questions */}
      {((summaryData.risk_flags?.length ?? 0) > 0 ||
        (summaryData.meeting_questions?.length ?? 0) > 0) && (
        <div
          className={cn(
            "grid grid-cols-2 gap-7",
            (summaryData.technical_stack?.length ?? 0) > 0 ? "mb-5.5" : ""
          )}
        >
          {(summaryData.risk_flags?.length ?? 0) > 0 && (
            <div>
              <div className="text-[13px] font-medium text-th-text mb-3">
                Risk Flags
              </div>
              {summaryData.risk_flags!.map((r, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <span className="text-[13px] shrink-0 text-amber-500">!</span>
                  <span className="text-[13px] text-th-muted leading-relaxed">
                    {r}
                  </span>
                </div>
              ))}
            </div>
          )}
          {(summaryData.meeting_questions?.length ?? 0) > 0 && (
            <div>
              <div className="text-[13px] font-medium text-th-text mb-3">
                Ask in Meeting
              </div>
              {summaryData.meeting_questions!.map((q, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <span className="text-[13px] shrink-0" style={{ color: acc }}>
                    ?
                  </span>
                  <span className="text-[13px] text-th-muted leading-relaxed">
                    {q}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Technical stack + Content gaps */}
      {((summaryData.technical_stack?.length ?? 0) > 0 ||
        (summaryData.content_gaps?.length ?? 0) > 0) && (
        <div className="grid grid-cols-2 gap-7 pt-4.5 border-t border-th-border-light">
          {(summaryData.technical_stack?.length ?? 0) > 0 && (
            <div>
              <div className="text-[13px] font-medium text-th-text mb-3">
                Recommended Stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summaryData.technical_stack!.map((t, i) => (
                  <span
                    key={i}
                    className="bg-th-surface-hover text-th-secondary rounded-md px-3 py-1 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(summaryData.content_gaps?.length ?? 0) > 0 && (
            <div>
              <div className="text-[13px] font-medium text-th-text mb-3">
                Content Gaps
              </div>
              {summaryData.content_gaps!.map((g, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <span className="text-xs text-red-500 shrink-0">-</span>
                  <span className="text-xs text-th-muted leading-normal">
                    {g}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
