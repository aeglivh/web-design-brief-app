import { useState } from "react";
import { Button, Alert } from "@/components/ui";
import type { Rates } from "@/lib/types";

type RatesData = Omit<Rates, "id" | "designer_id">;

interface RatesFormProps {
  rates: RatesData;
  onSave: (rates: RatesData) => Promise<void>;
  accent: string;
}

function SectionToggle({
  label,
  hint,
  open,
  onToggle,
  children,
}: {
  label: string;
  hint?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--th-border-light)" }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between cursor-pointer bg-transparent border-0 p-0"
        style={{ marginBottom: open ? 14 : 0 }}
      >
        <div className="text-left">
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--th-text-muted)",
            }}
          >
            {label}
          </span>
          {hint && !open && (
            <p className="text-[11px] text-th-muted" style={{ marginTop: 2, fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>
              {hint}
            </p>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-th-muted shrink-0"
          style={{
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function RateField({
  label,
  hint,
  value,
  onChange,
  suffix,
  step,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex items-baseline justify-between" style={{ marginBottom: 6 }}>
        <label className="text-[13px] font-medium text-th-secondary">
          {label}
        </label>
        {suffix && (
          <span className="text-[11px] text-th-muted">{suffix}</span>
        )}
      </div>
      {hint && (
        <p className="text-[11px] text-th-muted leading-relaxed" style={{ marginBottom: 6 }}>
          {hint}
        </p>
      )}
      <input
        type="number"
        min="0"
        step={step || "50"}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-xl border border-th-border bg-th-surface text-[13px] text-th-text outline-none focus:border-[var(--th-accent,#6366f1)] focus:ring-2 focus:ring-[var(--th-accent,#6366f1)]/10 transition-colors"
        style={{ padding: "10px 14px" }}
      />
    </div>
  );
}

export function RatesForm({ rates: initial, onSave, accent }: RatesFormProps) {
  const [pageRates, setPageRates] = useState(initial.page_rates);
  const [addonRates, setAddonRates] = useState(initial.addon_rates);
  const [hourly, setHourly] = useState(initial.hourly_rate);
  const [multipliers, setMultipliers] = useState(initial.multipliers);
  const [currency, setCurrency] = useState(initial.currency);
  const [vatRate, setVatRate] = useState(initial.vat_rate);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    pages: false,
    addons: false,
    complexity: false,
  });

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError("");
    try {
      await onSave({
        page_rates: pageRates,
        addon_rates: addonRates,
        hourly_rate: hourly,
        multipliers,
        currency,
        vat_rate: vatRate,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <form id="rates-form" onSubmit={handleSubmit}>
      {/* General */}
      <SectionToggle
        label="General"
        hint={`${currency} ${hourly}/hr${vatRate > 0 ? ` · ${vatRate}% VAT` : ""}`}
        open={openSections.general}
        onToggle={() => toggle("general")}
      >
        <p className="text-[11px] text-th-muted leading-relaxed" style={{ marginBottom: 14 }}>
          Your base currency and hourly rate. The hourly rate is used for add-ons and extras in quotes.
        </p>

        <div style={{ marginBottom: 14 }}>
          <label className="text-[13px] font-medium text-th-secondary" style={{ display: "block", marginBottom: 6 }}>
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-xl border border-th-border bg-th-surface text-sm text-th-text outline-none focus:border-[var(--th-accent,#6366f1)] focus:ring-2 focus:ring-[var(--th-accent,#6366f1)]/10 transition-colors"
            style={{ padding: "10px 14px", width: 120 }}
          >
            {["CHF", "EUR", "USD", "GBP"].map((c) => (
              <option key={c} value={c} className="bg-th-surface text-th-text">
                {c}
              </option>
            ))}
          </select>
        </div>

        <RateField
          label="Hourly Rate"
          hint="Used for custom work, revisions beyond included rounds, and time-based items."
          value={hourly}
          onChange={setHourly}
          suffix={`${currency}/hr`}
        />

        <RateField
          label="VAT Rate"
          hint="Set to 0 if VAT-exempt. VAT is added on top of the net quote total."
          value={vatRate}
          onChange={setVatRate}
          suffix="%"
          step="0.1"
        />
      </SectionToggle>

      {/* Page Rates */}
      <SectionToggle
        label="Page Rates"
        hint="Per-page pricing by type"
        open={openSections.pages}
        onToggle={() => toggle("pages")}
      >
        <p className="text-[11px] text-th-muted leading-relaxed" style={{ marginBottom: 14 }}>
          Fixed price per page type. The AI uses these to calculate the base cost of a website based on the pages the client needs.
        </p>
        <RateField
          label="Landing Page"
          hint="Full-width hero page with sections — typically the homepage."
          value={pageRates.landing}
          onChange={(v) => setPageRates((p) => ({ ...p, landing: v }))}
          suffix={currency}
        />
        <RateField
          label="Inner Page"
          hint="Standard content pages like About, Services, Contact."
          value={pageRates.inner}
          onChange={(v) => setPageRates((p) => ({ ...p, inner: v }))}
          suffix={currency}
        />
        <RateField
          label="Blog Page"
          hint="Blog listing + individual post template setup."
          value={pageRates.blog}
          onChange={(v) => setPageRates((p) => ({ ...p, blog: v }))}
          suffix={currency}
        />
        <RateField
          label="E-commerce Page"
          hint="Product listing, product detail, cart, and checkout pages."
          value={pageRates.ecommerce}
          onChange={(v) => setPageRates((p) => ({ ...p, ecommerce: v }))}
          suffix={currency}
        />
      </SectionToggle>

      {/* Add-on Rates */}
      <SectionToggle
        label="Feature Add-ons"
        hint="Extras like forms, SEO, booking"
        open={openSections.addons}
        onToggle={() => toggle("addons")}
      >
        <p className="text-[11px] text-th-muted leading-relaxed" style={{ marginBottom: 14 }}>
          Prices for common features and services. Added to the quote when the client selects these in the intake form.
        </p>
        {([
          { key: "contactForm", label: "Contact Form", hint: "Custom form with validation and email notifications." },
          { key: "gallery", label: "Image Gallery", hint: "Lightbox gallery or portfolio grid." },
          { key: "newsletter", label: "Newsletter Integration", hint: "Email signup with Mailchimp, ConvertKit, etc." },
          { key: "seo", label: "SEO Setup", hint: "On-page SEO, meta tags, sitemap, Search Console setup." },
          { key: "booking", label: "Booking System", hint: "Calendar integration for appointments (Calendly, Cal.com, etc.)." },
          { key: "ecommerce", label: "E-commerce Setup", hint: "Store configuration, payment gateway, shipping rules." },
          { key: "livechat", label: "Live Chat", hint: "Chat widget integration (Intercom, Crisp, etc.)." },
          { key: "multilanguage", label: "Multi-language", hint: "Translation setup with language switcher." },
          { key: "blog", label: "Blog Setup", hint: "Blog template, categories, and CMS configuration." },
          { key: "copywriting", label: "Copywriting", hint: "Professional copy for all pages." },
          { key: "photography", label: "Photography", hint: "Professional photos or stock image sourcing." },
          { key: "maintenance", label: "Maintenance Plan", hint: "Monthly maintenance, updates, and backups." },
          { key: "training", label: "Client Training", hint: "CMS training session and handover documentation." },
        ] as const).map((item) => (
          <RateField
            key={item.key}
            label={item.label}
            hint={item.hint}
            value={addonRates[item.key]}
            onChange={(v) => setAddonRates((p) => ({ ...p, [item.key]: v }))}
            suffix={currency}
          />
        ))}
      </SectionToggle>

      {/* Complexity Multipliers */}
      <SectionToggle
        label="Complexity Scaling"
        hint="Adjusts total based on project difficulty"
        open={openSections.complexity}
        onToggle={() => toggle("complexity")}
      >
        <p className="text-[11px] text-th-muted leading-relaxed" style={{ marginBottom: 14 }}>
          The AI assesses each project's complexity and applies a multiplier to the total. A value of <strong className="text-th-secondary">1.0</strong> means no adjustment. Values above 1.0 increase the price for more complex work.
        </p>
        <RateField
          label="Simple"
          hint="Straightforward brochure sites, minimal custom functionality. Multiplied by this value (e.g. 1.0 = no change)."
          value={multipliers.simple}
          onChange={(v) => setMultipliers((p) => ({ ...p, simple: v }))}
          suffix="x multiplier"
          step="0.1"
        />
        <RateField
          label="Moderate"
          hint="Custom design, CMS, several integrations. Typical for most projects."
          value={multipliers.moderate}
          onChange={(v) => setMultipliers((p) => ({ ...p, moderate: v }))}
          suffix="x multiplier"
          step="0.1"
        />
        <RateField
          label="Complex"
          hint="E-commerce, multi-language, custom features, heavy integrations."
          value={multipliers.complex}
          onChange={(v) => setMultipliers((p) => ({ ...p, complex: v }))}
          suffix="x multiplier"
          step="0.1"
        />
      </SectionToggle>

      <div style={{ marginTop: 8 }}>
        {error && <Alert variant="error" className="mb-3">{error}</Alert>}
        <Button type="submit" fullWidth accent={accent}>
          {saved ? "Saved!" : "Save Rates"}
        </Button>
      </div>
    </form>
  );
}
