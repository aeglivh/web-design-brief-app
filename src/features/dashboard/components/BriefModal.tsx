import { useState, useEffect } from "react";
import { BriefDisplay } from "@/features/brief/components/BriefDisplay";
import { BriefSummaryCard } from "@/features/brief/components/BriefSummaryCard";
import { QuoteTable } from "@/features/quote/components/QuoteTable";
import { QuoteModal } from "@/features/quote/components/QuoteModal";
import { useContractGeneration } from "@/features/contract/hooks/useContractGeneration";
import { ContractModal } from "@/features/contract/components/ContractModal";
import { ProjectUpdatesPanel } from "./ProjectUpdatesPanel";
import { PortalControls } from "./PortalControls";
import { ProjectLinksPanel } from "./ProjectLinksPanel";
import { authFetch, API_BASE } from "@/lib/api";
import { isLight } from "@/lib/utils";
import type { Brief, Quote } from "@/lib/types";

type ModalTab = "brief" | "updates" | "portal";

interface BriefModalProps {
  brief: Brief;
  studioName: string;
  slug: string;
  accent: string;
  logoUrl?: string;
  formBgColour?: string;
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
  slug,
  accent,
  formBgColour,
  onClose,
  onQuoteGenerated,
}: BriefModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("brief");

  // Brief card uses the same background as the intake form
  const cardBg = formBgColour || "#ffffff";
  const cardIsLight = isLight(cardBg);
  const cardText = cardIsLight ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.88)";
  const cardTextSecondary = cardIsLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)";
  const cardTextMuted = cardIsLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)";
  const cardBorder = cardIsLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const cardBorderLight = cardIsLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)";
  const cardSurface = cardIsLight ? "#f8f9fa" : "rgba(255,255,255,0.04)";
  const cardSurfaceHover = cardIsLight ? "#f0f1f3" : "rgba(255,255,255,0.07)";
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const { generate: generateContract, generating: contractLoading, load: loadContract, save: saveContract, sign: signContract, saving: contractSaving, contract, error: contractError } = useContractGeneration();

  // Load existing contract on mount
  useEffect(() => {
    loadContract(brief.id);
  }, [brief.id, loadContract]);

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
        contractId={contract.id}
        data={contract.contract_data}
        studioName={studioName}
        clientName={brief.client_name}
        businessName={brief.business_name}
        currency={brief.quote?.currency || "CHF"}
        accent={accent}
        onSave={saveContract}
        onSign={signContract}
        saving={contractSaving}
        designerSignedName={contract.designer_signed_name}
        designerSignedAt={contract.designer_signed_at}
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
        backgroundColor: "var(--th-bg)",
        overflowY: "auto",
      }}
    >
      {/* Sticky toolbar */}
      <div
        className="sticky top-0 z-10 no-print"
        style={{
          backgroundColor: "var(--th-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--th-border)",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-8">
          <div className="flex items-center" style={{ gap: 8 }}>
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-[13px] font-medium cursor-pointer transition-colors bg-transparent border-0"
              style={{ color: "var(--th-text-muted)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <div style={{ width: 1, height: 20, backgroundColor: "var(--th-border)", margin: "0 4px" }} />
            {(["brief", "updates", "portal"] as ModalTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="h-8 px-3 rounded-lg text-[12px] font-medium cursor-pointer transition-all border-0"
                style={{
                  backgroundColor: activeTab === tab ? "var(--th-surface-hover)" : "transparent",
                  color: activeTab === tab ? "var(--th-text)" : "var(--th-text-muted)",
                }}
              >
                {tab === "brief" ? "Brief" : tab === "updates" ? "Updates" : "Portal"}
              </button>
            ))}
            <div style={{ width: 1, height: 20, backgroundColor: "var(--th-border)", margin: "0 4px" }} />
            <a
              href={`${window.location.origin}/studio/${slug}/${brief.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-lg text-[12px] font-medium transition-all flex items-center"
              style={{
                color: "var(--th-text-muted)",
                textDecoration: "none",
                gap: 5,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Client Portal
            </a>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "brief" && (
              <>
                {brief.quote ? (
                  <>
                    <button
                      onClick={() => setShowQuote(true)}
                      className="h-8 px-4 rounded-full text-[12px] font-medium transition-all cursor-pointer border"
                      style={{
                        backgroundColor: "rgba(16,185,129,0.08)",
                        color: "#34d399",
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
                        color: "#a78bfa",
                        borderColor: "rgba(139,92,246,0.2)",
                      }}
                    >
                      {contractLoading ? "Generating..." : contract ? "View Contract" : "Generate Contract"}
                    </button>
                  </>
                ) : (
                  <>
                    {quoteError && (
                      <span className="text-[11px] max-w-[200px] truncate" style={{ color: "#ef4444" }} title={quoteError}>
                        {quoteError}
                      </span>
                    )}
                    <button
                      onClick={generateQuote}
                      disabled={quoteLoading}
                      className="h-8 px-4 rounded-full text-[12px] font-medium transition-all cursor-pointer disabled:opacity-50 border"
                      style={{
                        backgroundColor: "rgba(16,185,129,0.08)",
                        color: "#34d399",
                        borderColor: "rgba(16,185,129,0.2)",
                      }}
                    >
                      {quoteLoading ? "Generating..." : "Generate Quote"}
                    </button>
                  </>
                )}
                {contractError && (
                  <span className="text-[11px] max-w-[200px] truncate" style={{ color: "#ef4444" }} title={contractError}>
                    {contractError}
                  </span>
                )}
                <button
                  onClick={() => window.print()}
                  className="h-8 px-4 rounded-full text-[12px] font-medium transition-all cursor-pointer border"
                  style={{
                    color: "var(--th-text-muted)",
                    borderColor: "var(--th-border)",
                  }}
                >
                  Download Brief
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Brief tab — white paper card on dark background */}
      <div
        className="max-w-4xl mx-auto"
        style={{ padding: "32px 24px 80px", display: activeTab === "brief" ? undefined : "none" }}
      >
          <div
            className="rounded-[16px]"
            style={{
              backgroundColor: cardBg,
              padding: "64px 80px 80px",
              color: cardText,
              "--th-surface": cardSurface,
              "--color-th-surface": cardSurface,
              "--th-surface-hover": cardSurfaceHover,
              "--color-th-surface-hover": cardSurfaceHover,
              "--th-text": cardText,
              "--color-th-text": cardText,
              "--th-text-secondary": cardTextSecondary,
              "--color-th-secondary": cardTextSecondary,
              "--th-text-muted": cardTextMuted,
              "--color-th-muted": cardTextMuted,
              "--th-border": cardBorder,
              "--color-th-border": cardBorder,
              "--th-border-light": cardBorderLight,
              "--color-th-border-light": cardBorderLight,
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
              style={{ fontSize: 32, color: cardText, marginBottom: 16 }}
            >
              Web Design Brief
            </h1>
            <div style={{ height: 1, backgroundColor: cardBorder, marginBottom: 14 }} />
            <div className="text-[13px] leading-[1.8]" style={{ color: cardTextSecondary, marginBottom: 14 }}>
              <strong style={{ color: cardText, fontWeight: 500 }}>{brief.client_name}</strong>
              {brief.business_name && <span style={{ color: cardTextMuted }}> &nbsp;/&nbsp; </span>}
              {brief.business_name && <span>{brief.business_name}</span>}
              {brief.budget && <span style={{ color: cardTextMuted }}> &nbsp;/&nbsp; </span>}
              {brief.budget && <span>{brief.budget}</span>}
              {brief.project_type && <span style={{ color: cardTextMuted }}> &nbsp;/&nbsp; </span>}
              {brief.project_type && (
                <span>{brief.project_type === "redesign" ? "Redesign" : "New site"}</span>
              )}
            </div>
            <div style={{ height: 1, backgroundColor: cardBorderLight, marginBottom: 48 }} />

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
                borderTop: `1px solid ${cardBorderLight}`,
              }}
            >
              <span className="text-[11px]" style={{ color: cardTextMuted }}>
                Generated by {studioName || "debrieft"}
              </span>
              <span className="text-[11px]" style={{ color: cardTextMuted }}>
                {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
      </div>

      {/* Updates tab */}
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "40px 24px 80px",
          display: activeTab === "updates" ? undefined : "none",
        }}
      >
        <ProjectUpdatesPanel briefId={brief.id} accent={accent} />
      </div>

      {/* Portal controls tab */}
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "40px 24px 80px",
          display: activeTab === "portal" ? undefined : "none",
        }}
      >
          <PortalControls
            briefId={brief.id}
            slug={slug}
            accent={accent}
            initialValues={{
              portal_status: brief.portal_status,
              brief_visible: brief.brief_visible,
              quote_visible: brief.quote_visible,
              contract_visible: brief.contract_visible,
              portal_paused: brief.portal_paused,
              deposit_url: brief.deposit_url,
              client_email: brief.client_email,
              project_phases: brief.project_phases,
            }}
            contractStatus={{
              designerSignedName: contract?.designer_signed_name || null,
              designerSignedAt: contract?.designer_signed_at || null,
              clientSignedName: brief.signed_name || null,
              clientSignedAt: brief.signed_at || null,
            }}
          />
          <ProjectLinksPanel briefId={brief.id} accent={accent} />
      </div>
    </div>
  );
}
