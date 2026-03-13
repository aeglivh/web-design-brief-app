import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/lib/supabase";
import { useDesigner } from "../hooks/useDesigner";
import { useBriefs } from "../hooks/useBriefs";
import { useRates } from "../hooks/useRates";
import { DashboardLayout } from "@/components/layout";
import { Spinner } from "@/components/ui";
import { OnboardingModal } from "../components/OnboardingModal";
import { BriefsList } from "../components/BriefsList";
import { BriefModal } from "../components/BriefModal";
import { BrandingForm, getInitialBranding } from "@/features/settings/components/BrandingForm";
import { BrandingPreview } from "@/features/settings/components/BrandingPreview";
import { RatesForm } from "@/features/settings/components/RatesForm";
import { cn } from "@/lib/cn";
import type { Brief, Quote } from "@/lib/types";
import type { BrandingState } from "@/features/settings/components/BrandingForm";

const TABS = [
  { id: "briefs", label: "Briefs" },
  { id: "settings", label: "Branding" },
  { id: "rates", label: "Rates" },
];

export default function DashboardPage() {
  const session = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const urlBriefId = new URLSearchParams(location.search).get("brief");

  const {
    designer,
    loading: dLoading,
    needsOnboarding,
    updateDesigner,
    createDesigner,
  } = useDesigner(session);

  const {
    briefs,
    loading: bLoading,
    deleteBrief,
    updateBriefQuote,
  } = useBriefs(session);

  const { rates, saveRates } = useRates(session);

  const [activeTab, setActiveTab] = useState("briefs");
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [copied, setCopied] = useState(false);
  const [pricingMode, setPricingMode] = useState<"landing" | "multipage">("multipage");

  // Branding form state (lifted for live preview)
  const [brandingForm, setBrandingForm] = useState<BrandingState | null>(null);
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [brandingError, setBrandingError] = useState("");

  useEffect(() => {
    if (designer && !brandingForm) {
      setBrandingForm(getInitialBranding(designer));
    }
  }, [designer, brandingForm]);

  useEffect(() => {
    if (session === null) navigate("/login");
  }, [session, navigate]);

  useEffect(() => {
    if (urlBriefId && briefs.length > 0 && !selectedBrief) {
      const match = briefs.find((b) => b.id === urlBriefId);
      if (match) setSelectedBrief(match);
    }
  }, [briefs, urlBriefId, selectedBrief]);

  const copyLink = () => {
    const url = `${window.location.origin}/studio/${designer?.slug}`;
    navigator.clipboard.writeText(url).catch(() => {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBrandingChange = (key: string, val: string) => {
    setBrandingForm((prev) => prev ? { ...prev, [key]: val } : prev);
  };

  const handleBrandingSave = async (form: BrandingState) => {
    setBrandingSaved(false);
    setBrandingError("");
    try {
      await updateDesigner(form);
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 3000);
    } catch (err) {
      setBrandingError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleQuoteGenerated = (briefId: string, quote: Quote) => {
    updateBriefQuote(briefId, quote);
    if (selectedBrief?.id === briefId) {
      setSelectedBrief((prev) => (prev ? { ...prev, quote } : prev));
    }
  };

  if (session === undefined || dLoading || bLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--th-bg)" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const acc = brandingForm?.accent_color || designer?.accent_color || "#3b82f6";
  const barColor = brandingForm?.dashboard_bar_colour || designer?.dashboard_bar_colour || "#0f172a";
  const bgColor = brandingForm?.dashboard_bg_colour || designer?.dashboard_bg_colour || "";

  // Dynamically load Google Fonts for branding preview
  const headingFont = brandingForm?.heading_font || designer?.heading_font || "Inter";
  const bodyFont = brandingForm?.body_font || designer?.body_font || "Inter";
  useEffect(() => {
    const fonts = new Set([headingFont, bodyFont].filter((f) => f && f !== "Inter"));
    if (fonts.size === 0) return;
    const families = [...fonts].map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`).join("&");
    const id = "branding-fonts";
    if (document.getElementById(id)) document.getElementById(id)!.remove();
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }, [headingFont, bodyFont]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Horizontal tabs */}
      <div className="flex px-3 pt-3 gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2 text-[12px] font-medium cursor-pointer transition-all duration-200 rounded-lg",
                active
                  ? "text-th-text"
                  : "text-th-muted hover:text-th-secondary"
              )}
              style={{
                backgroundColor: active ? "var(--th-surface-hover)" : "transparent",
                boxShadow: active
                  ? "inset 0 1px 0 var(--th-border-light)"
                  : "none",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ margin: "8px 16px", height: 1, backgroundColor: "var(--th-border-light)" }} />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {activeTab === "briefs" && designer?.slug && (
          <div
            className="rounded-[16px] p-3"
            style={{
              background: "linear-gradient(135deg, var(--th-surface-hover) 0%, var(--th-surface) 100%)",
              border: "1px solid var(--th-border-light)",
            }}
          >
            <p className="text-[11px] text-th-muted font-medium mb-2">Client form</p>
            <div className="bg-th-surface rounded-lg px-2.5 py-2 mb-2.5">
              <p className="text-[11px] text-th-secondary font-mono break-all leading-relaxed">
                {window.location.origin}/studio/{designer.slug}
              </p>
            </div>
            <button
              onClick={copyLink}
              className="w-full h-7 rounded-full text-[11px] font-medium text-th-text cursor-pointer transition-colors hover:opacity-90"
              style={{ backgroundColor: acc }}
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        )}

        {activeTab === "settings" && brandingForm && (
          <BrandingForm
            form={brandingForm}
            onChange={handleBrandingChange}
            onSave={handleBrandingSave}
            accent={acc}
            saved={brandingSaved}
            error={brandingError}
          />
        )}

        {activeTab === "rates" && (
          <RatesForm rates={rates} onSave={saveRates} accent={acc} />
        )}
      </div>
    </div>
  );

  return (
    <>
      {needsOnboarding && (
        <OnboardingModal onDone={() => {}} onCreate={createDesigner} />
      )}

      {selectedBrief && (
        <BriefModal
          brief={selectedBrief}
          studioName={designer?.studio_name || ""}
          accent={acc}
          logoUrl={designer?.logo_url}
          onClose={() => setSelectedBrief(null)}
          onQuoteGenerated={handleQuoteGenerated}
        />
      )}

      <DashboardLayout
        studioName={brandingForm?.studio_name || designer?.studio_name || ""}
        slug={brandingForm?.slug || designer?.slug}
        accent={acc}
        barColor={barColor}
        bgColor={bgColor}
        sidebar={sidebarContent}
        fullWidth={activeTab === "briefs"}
      >
        {activeTab === "briefs" && (
          <BriefsList
            briefs={briefs}
            accent={acc}
            slug={designer?.slug}
            onSelect={setSelectedBrief}
            onDelete={deleteBrief}
            onCopyLink={copyLink}
            copied={copied}
          />
        )}

        {activeTab === "settings" && brandingForm && (
          <BrandingPreview form={brandingForm} />
        )}

        {activeTab === "rates" && (
          <div className="max-w-[680px] mx-auto" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 className="text-[20px] font-light tracking-[-0.02em] text-th-text mb-2">
              Rate Configuration
            </h2>
            <p className="text-[13px] text-th-muted max-w-lg" style={{ marginTop: -16 }}>
              These rates are used by the AI to generate accurate quotes for your clients.
              Adjust them in the sidebar to match your pricing.
            </p>

            {/* Pricing mode toggle */}
            <div
              className="rounded-[16px] p-4"
              style={{ border: "1px solid var(--th-border-light)", background: "var(--th-surface)" }}
            >
              <p className="text-[10px] font-medium text-th-muted uppercase tracking-[0.15em] mb-3">Pricing Mode</p>
              <div className="flex rounded-xl gap-2">
                <button
                  type="button"
                  onClick={() => setPricingMode("landing")}
                  className="flex-1 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: pricingMode === "landing" ? acc + "22" : "transparent",
                    color: pricingMode === "landing" ? "var(--th-text)" : "var(--th-text-secondary)",
                    border: pricingMode === "landing" ? `1px solid ${acc}44` : "1px solid var(--th-border-light)",
                  }}
                >
                  Landing Page Only
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode("multipage")}
                  className="flex-1 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: pricingMode === "multipage" ? acc + "22" : "transparent",
                    color: pricingMode === "multipage" ? "var(--th-text)" : "var(--th-text-secondary)",
                    border: pricingMode === "multipage" ? `1px solid ${acc}44` : "1px solid var(--th-border-light)",
                  }}
                >
                  Multi-page Website
                </button>
              </div>
              <p className="text-[11px] text-th-muted mt-2">
                {pricingMode === "landing"
                  ? "Quotes will be based on a single landing page with optional add-ons."
                  : "Quotes will include multiple page types, add-ons, and complexity scaling."}
              </p>
            </div>

            {/* Rate summary cards */}
            <div className="grid grid-cols-2 gap-6">
              <div
                className="rounded-[16px] p-7"
                style={{ border: "1px solid var(--th-border-light)", background: "var(--th-surface)" }}
              >
                <p className="text-[10px] font-medium text-th-muted uppercase tracking-[0.15em] mb-4">
                  {pricingMode === "landing" ? "Landing Page Rate" : "Page Rates"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(pricingMode === "landing"
                    ? [{ label: "Landing Page", value: rates.page_rates.landing }]
                    : [
                        { label: "Landing", value: rates.page_rates.landing },
                        { label: "Inner", value: rates.page_rates.inner },
                        { label: "Blog", value: rates.page_rates.blog },
                        { label: "E-commerce", value: rates.page_rates.ecommerce },
                      ]
                  ).map((r) => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-[13px] text-th-secondary">{r.label}</span>
                      <span className="text-[13px] font-medium text-th-text tabular-nums">
                        {rates.currency} {r.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-[16px] p-7"
                style={{ border: "1px solid var(--th-border-light)", background: "var(--th-surface)" }}
              >
                <p className="text-[10px] font-medium text-th-muted uppercase tracking-[0.15em] mb-4">Pricing Model</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-th-secondary">Hourly rate</span>
                    <span className="text-[13px] font-medium text-th-text tabular-nums">
                      {rates.currency} {rates.hourly_rate.toLocaleString()}/hr
                    </span>
                  </div>
                  {pricingMode === "multipage" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-th-secondary">Simple projects</span>
                        <span className="text-[13px] font-medium text-th-text tabular-nums">
                          {rates.multipliers.simple}x
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-th-secondary">Moderate projects</span>
                        <span className="text-[13px] font-medium text-th-text tabular-nums">
                          {rates.multipliers.moderate}x
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-th-secondary">Complex projects</span>
                        <span className="text-[13px] font-medium text-th-text tabular-nums">
                          {rates.multipliers.complex}x
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-th-secondary">VAT</span>
                    <span className="text-[13px] font-medium text-th-text tabular-nums">
                      {rates.vat_rate > 0 ? `${rates.vat_rate}%` : "Exempt"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample quote estimate */}
            <div
              className="rounded-[16px] p-7"
              style={{ border: "1px solid var(--th-border-light)", background: "var(--th-surface)" }}
            >
              <p className="text-[10px] font-medium text-th-muted uppercase tracking-[0.15em] mb-4">
                Sample Quote Estimate
              </p>
              {pricingMode === "landing" ? (
                <>
                  <p className="text-[12px] text-th-muted mb-4">
                    A landing page with contact form and SEO:
                  </p>
                  {(() => {
                    const page = rates.page_rates.landing;
                    const addons = rates.addon_rates.contactForm + rates.addon_rates.seo;
                    const net = page + addons;
                    const vat = rates.vat_rate > 0 ? Math.round(net * rates.vat_rate / 100) : 0;
                    const grand = net + vat;
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-th-secondary">Landing page</span>
                          <span className="text-th-text tabular-nums">{rates.currency} {page.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-th-secondary">Add-ons (form + SEO)</span>
                          <span className="text-th-text tabular-nums">{rates.currency} {addons.toLocaleString()}</span>
                        </div>
                        <div style={{ height: 1, backgroundColor: "var(--th-border-light)", margin: "4px 0" }} />
                        <div className="flex justify-between text-[13px]">
                          <span className="text-th-secondary">Net total</span>
                          <span className="text-th-text tabular-nums">{rates.currency} {net.toLocaleString()}</span>
                        </div>
                        {vat > 0 && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-th-secondary">VAT ({rates.vat_rate}%)</span>
                            <span className="text-th-text tabular-nums">{rates.currency} {vat.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[13px]">
                          <span className="text-th-secondary">{vat > 0 ? "Total incl. VAT" : "Total"}</span>
                          <span className="text-th-text font-medium tabular-nums">{rates.currency} {grand.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <>
                  <p className="text-[12px] text-th-muted mb-4">
                    A moderate 5-page site (1 landing + 3 inner + 1 blog) with contact form and SEO:
                  </p>
                  {(() => {
                    const pages = rates.page_rates.landing + rates.page_rates.inner * 3 + rates.page_rates.blog;
                    const addons = rates.addon_rates.contactForm + rates.addon_rates.seo;
                    const subtotal = pages + addons;
                    const net = Math.round(subtotal * rates.multipliers.moderate);
                    const vat = rates.vat_rate > 0 ? Math.round(net * rates.vat_rate / 100) : 0;
                    const grand = net + vat;
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-th-secondary">Pages (1 landing + 3 inner + 1 blog)</span>
                          <span className="text-th-text tabular-nums">{rates.currency} {pages.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-th-secondary">Add-ons (form + SEO)</span>
                          <span className="text-th-text tabular-nums">{rates.currency} {addons.toLocaleString()}</span>
                        </div>
                        <div style={{ height: 1, backgroundColor: "var(--th-border-light)", margin: "4px 0" }} />
                        <div className="flex justify-between text-[13px]">
                          <span className="text-th-secondary">Subtotal</span>
                          <span className="text-th-text tabular-nums">{rates.currency} {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-th-secondary">Moderate complexity ({rates.multipliers.moderate}x)</span>
                          <span className="text-th-text tabular-nums">{rates.currency} {net.toLocaleString()}</span>
                        </div>
                        {vat > 0 && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-th-secondary">VAT ({rates.vat_rate}%)</span>
                            <span className="text-th-text tabular-nums">{rates.currency} {vat.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[13px]">
                          <span className="text-th-secondary">{vat > 0 ? "Total incl. VAT" : "Net total"}</span>
                          <span className="text-th-text font-medium tabular-nums">{rates.currency} {grand.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Save button (submits sidebar rates form) */}
            <button
              type="submit"
              form="rates-form"
              className="w-full py-2 rounded-full text-[13px] font-medium text-th-text cursor-pointer transition-all border backdrop-blur-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: acc + "22",
                borderColor: acc + "44",
              }}
            >
              Save Rates
            </button>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
