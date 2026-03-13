import { useState, useEffect } from "react";
import { BriefDisplay } from "@/features/brief/components/BriefDisplay";
import { BriefSummaryCard } from "@/features/brief/components/BriefSummaryCard";
import { QuoteTable } from "@/features/quote/components/QuoteTable";
import { QuoteModal } from "@/features/quote/components/QuoteModal";
import { useContractGeneration } from "@/features/contract/hooks/useContractGeneration";
import { ContractModal } from "@/features/contract/components/ContractModal";
import { authFetch, API_BASE } from "@/lib/api";
import type { Brief, Quote } from "@/lib/types";

interface BriefModalProps {
  brief: Brief;
  studioName: string;
  accent: string;
  logoUrl?: string;
  onClose: () => void;
  onQuoteGenerated: (briefId: string, quote: Quote) => void;
}

interface SummaryData {
  key_requirements?: string[];
  technical_stack?: string[];
  content_gaps?: string[];
  risk_flags?: string[];
  meeting_questions?: string[];
}

export function BriefModal({
  brief,
  studioName,
  accent,
  onClose,
  onQuoteGenerated,
}: BriefModalProps) {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const { generate: generateContract, generating: contractLoading, contract, error: contractError } = useContractGeneration();

  // Lock body scroll when open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!brief.brief_text) return;
    fetch(`${API_BASE}/api/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefText: brief.brief_text }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.summaryData) setSummaryData(d.summaryData);
      })
      .catch(() => {});
  }, [brief.brief_text]);

  const generateQuote = async () => {
    setQuoteLoading(true);
    setQuoteError("");
    try {
      const res = await authFetch(`${API_BASE}/api/quote`, {
        method: "POST",
        body: JSON.stringify({ briefId: brief.id }),
      });
      const data = await res.json();
      if (data.quote) {
        onQuoteGenerated(brief.id, data.quote);
        setShowQuote(true);
      } else {
        setQuoteError(data.error || "Failed to generate quote");
      }
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : "Network error");
    }
    setQuoteLoading(false);
  };

  const handleGenerateContract = async () => {
    const result = await generateContract(brief.id);
    if (result) setShowContract(true);
  };

  if (showContract && contract) {
    return (
      <ContractModal
        data={contract.contract_data}
        studioName={studioName}
        clientName={brief.client_name}
        businessName={brief.business_name}
        currency={brief.quote?.currency || "CHF"}
        accent={accent}
        onClose={() => setShowContract(false)}
      />
    );
  }

  if (showQuote && brief.quote) {
    return (
      <QuoteModal
        quote={brief.quote}
        businessName={brief.business_name}
        accent={accent}
        onClose={() => setShowQuote(false)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 brief-full-page"
      style={{
        backgroundColor: "#ffffff",
        overflowY: "auto",
      }}
    >
      {/* Sticky toolbar */}
      <div
        className="sticky top-0 z-10 no-print"
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[13px] font-medium cursor-pointer transition-colors bg-transparent border-0"
            style={{ color: "rgba(0,0,0,0.5)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to dashboard
          </button>
          <div className="flex items-center gap-2">
            {brief.quote ? (
              <>
                <button
                  onClick={() => setShowQuote(true)}
                  className="h-8 px-4 rounded-full text-[12px] font-medium transition-all cursor-pointer border"
                  style={{
                    backgroundColor: "rgba(16,185,129,0.08)",
                    color: "#059669",
                    borderColor: "rgba(16,185,129,0.2)",
                  }}
                >
                  View Quote
                </button>
                <button
                  onClick={contract ? () => setShowContract(true) : handleGenerateContract}
                  disabled={contractLoading}
                  className="h-8 px-4 rounded-full text-[12px] font-medium transition-all cursor-pointer disabled:opacity-50 border"
                  style={{
                    backgroundColor: "rgba(139,92,246,0.08)",
                    color: "#7c3aed",
                    borderColor: "rgba(139,92,246,0.2)",
                  }}
                >
                  {contractLoading ? "Generating..." : contract ? "View Contract" : "Generate Contract"}
                </button>
              </>
            ) : (
              <>
                {quoteError && (
                  <span className="text-[11px] max-w-[200px] truncate" style={{ color: "#dc2626" }} title={quoteError}>
                    {quoteError}
                  </span>
                )}
                <button
                  onClick={generateQuote}
                  disabled={quoteLoading}
                  className="h-8 px-4 rounded-full text-[12px] font-medium transition-all cursor-pointer disabled:opacity-50 border"
                  style={{
                    backgroundColor: "rgba(16,185,129,0.08)",
                    color: "#059669",
                    borderColor: "rgba(16,185,129,0.2)",
                  }}
                >
                  {quoteLoading ? "Generating..." : "Generate Quote"}
                </button>
              </>
            )}
            {contractError && (
              <span className="text-[11px] max-w-[200px] truncate" style={{ color: "#dc2626" }} title={contractError}>
                {contractError}
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="h-8 px-4 rounded-full text-[12px] font-medium transition-all cursor-pointer border"
              style={{
                color: "rgba(0,0,0,0.5)",
                borderColor: "rgba(0,0,0,0.1)",
              }}
            >
              Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Document — force light CSS vars for theme-aware child components */}
      <div
        className="max-w-4xl mx-auto"
        style={{
          padding: "64px 80px 80px",
          color: "rgba(0,0,0,0.85)",
          "--th-surface": "#f8f9fa",
          "--color-th-surface": "#f8f9fa",
          "--th-surface-hover": "#f0f1f3",
          "--color-th-surface-hover": "#f0f1f3",
          "--th-text": "rgba(0,0,0,0.88)",
          "--color-th-text": "rgba(0,0,0,0.88)",
          "--th-text-secondary": "rgba(0,0,0,0.55)",
          "--color-th-secondary": "rgba(0,0,0,0.55)",
          "--th-text-muted": "rgba(0,0,0,0.35)",
          "--color-th-muted": "rgba(0,0,0,0.35)",
          "--th-border": "rgba(0,0,0,0.1)",
          "--color-th-border": "rgba(0,0,0,0.1)",
          "--th-border-light": "rgba(0,0,0,0.05)",
          "--color-th-border-light": "rgba(0,0,0,0.05)",
        } as React.CSSProperties}
      >
        {/* Header */}
        <div
          className="rounded-full"
          style={{ width: 40, height: 3, backgroundColor: accent, marginBottom: 32 }}
        />
        <div
          className="text-[10px] tracking-[0.2em] uppercase font-semibold"
          style={{ color: accent, marginBottom: 16 }}
        >
          {studioName || "Web Design Brief"}
        </div>
        <h1
          className="font-medium leading-tight tracking-[-0.02em]"
          style={{ fontSize: 32, color: "rgba(0,0,0,0.88)", marginBottom: 16 }}
        >
          Web Design Brief
        </h1>
        <div style={{ height: 1, backgroundColor: "rgba(0,0,0,0.1)", marginBottom: 14 }} />
        <div className="text-[13px] leading-[1.8]" style={{ color: "rgba(0,0,0,0.6)", marginBottom: 14 }}>
          <strong style={{ color: "rgba(0,0,0,0.85)", fontWeight: 500 }}>{brief.client_name}</strong>
          {brief.business_name && <span style={{ color: "rgba(0,0,0,0.3)" }}> &nbsp;/&nbsp; </span>}
          {brief.business_name && <span>{brief.business_name}</span>}
          {brief.budget && <span style={{ color: "rgba(0,0,0,0.3)" }}> &nbsp;/&nbsp; </span>}
          {brief.budget && <span>{brief.budget}</span>}
          {brief.project_type && <span style={{ color: "rgba(0,0,0,0.3)" }}> &nbsp;/&nbsp; </span>}
          {brief.project_type && (
            <span>{brief.project_type === "redesign" ? "Redesign" : "New site"}</span>
          )}
        </div>
        <div style={{ height: 1, backgroundColor: "rgba(0,0,0,0.05)", marginBottom: 48 }} />

        <BriefSummaryCard summaryData={summaryData} accent={accent} />

        <BriefDisplay
          brief={brief.brief_text}
          tags={brief.tags}
          accent={accent}
        />

        {/* Footer */}
        <div
          className="flex items-center justify-between"
          style={{
            marginTop: 56,
            paddingTop: 20,
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span className="text-[11px]" style={{ color: "rgba(0,0,0,0.35)" }}>
            Generated by {studioName || "Briefflow"}
          </span>
          <span className="text-[11px]" style={{ color: "rgba(0,0,0,0.35)" }}>
            {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}
