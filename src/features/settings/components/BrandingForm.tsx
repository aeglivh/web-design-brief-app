import { useState } from "react";
import { Input, Button, Alert, ColorPicker } from "@/components/ui";
import type { Designer } from "@/lib/types";

const ACCENTS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#f59e0b", "#10b981", "#0f172a", "#64748b",
];
const BG_PRESETS = [
  "#f1f5f9", "#f8fafc", "#f0f0f0", "#ffffff",
  "#0f172a", "#1e293b", "#faf5ff", "#f0fdf4",
];
const HEADING_FONTS = [
  "Inter", "Cormorant Garamond", "Playfair Display",
  "EB Garamond", "Lora", "Libre Baskerville",
];
const BODY_FONTS = ["Inter", "DM Sans", "Jost", "Karla"];

export type BrandingState = {
  studio_name: string;
  tagline: string;
  slug: string;
  designer_email: string;
  logo_url: string;
  accent_color: string;
  bg_color: string;
  form_bg_colour: string;
  dashboard_bg_colour: string;
  dashboard_bar_colour: string;
  heading_font: string;
  body_font: string;
};

export function getInitialBranding(designer: Designer): BrandingState {
  return {
    studio_name: designer.studio_name || "",
    tagline: designer.tagline || "",
    slug: designer.slug || "",
    designer_email: designer.designer_email || "",
    logo_url: designer.logo_url || "",
    accent_color: designer.accent_color || "#3b82f6",
    bg_color: designer.bg_color || "#f1f5f9",
    form_bg_colour: designer.form_bg_colour || "#ffffff",
    dashboard_bg_colour: designer.dashboard_bg_colour || "#08080c",
    dashboard_bar_colour: designer.dashboard_bar_colour || "#0f172a",
    heading_font: designer.heading_font || "Inter",
    body_font: designer.body_font || "Inter",
  };
}

interface BrandingFormProps {
  form: BrandingState;
  onChange: (key: string, val: string) => void;
  onSave: (form: BrandingState) => Promise<unknown>;
  accent: string;
  saved: boolean;
  error: string;
}

function SectionToggle({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
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
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-th-muted"
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

export function BrandingForm({ form, onChange, onSave, accent, saved, error }: BrandingFormProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    studio: true,
    colors: false,
    typography: false,
  });

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange("logo_url", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Studio Details & Logo */}
      <SectionToggle label="Studio" open={openSections.studio} onToggle={() => toggle("studio")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
          {[
            { label: "Name", key: "studio_name", ph: "Pixel Studio" },
            { label: "Tagline", key: "tagline", ph: "Websites with purpose." },
            { label: "Slug", key: "slug", ph: "pixel-studio", hint: "yoursite.com/studio/[slug]" },
            { label: "Email", key: "designer_email", ph: "hello@studio.com", type: "email" },
          ].map((f) => (
            <Input
              key={f.key}
              label={f.label}
              type={f.type || "text"}
              value={form[f.key as keyof BrandingState]}
              onChange={(e) => onChange(f.key, e.target.value)}
              placeholder={f.ph}
              hint={f.hint}
            />
          ))}
        </div>

        {/* Logo */}
        <p style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--th-text-muted)", marginBottom: 10 }}>Logo</p>
        <div style={{ marginBottom: 4 }}>
          {form.logo_url && (
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <img
                src={form.logo_url}
                alt="Logo"
                className="w-10 h-10 object-contain border border-th-border rounded-lg bg-th-surface p-0.5"
              />
              <button
                type="button"
                onClick={() => onChange("logo_url", "")}
                className="text-[11px] border border-th-border rounded-lg px-2 py-1 text-th-secondary cursor-pointer hover:bg-th-surface-hover bg-transparent transition-colors"
              >
                Remove
              </button>
            </div>
          )}
          <label className="flex items-center gap-2 border border-dashed border-th-border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-th-surface transition-colors bg-th-surface">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-th-muted">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-[12px] text-th-muted">
              {form.logo_url ? "Change logo..." : "Upload SVG or PNG"}
            </span>
            <input
              type="file"
              accept=".svg,.png,image/svg+xml,image/png"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </label>
        </div>
      </SectionToggle>

      {/* Colors */}
      <SectionToggle label="Colors" open={openSections.colors} onToggle={() => toggle("colors")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 4 }}>
          <ColorPicker label="Accent" value={form.accent_color} onChange={(c) => onChange("accent_color", c)} presets={ACCENTS} />
          <ColorPicker label="Form background" value={form.form_bg_colour} onChange={(c) => onChange("form_bg_colour", c)} presets={BG_PRESETS} />
          <ColorPicker label="Dashboard background" value={form.dashboard_bg_colour} onChange={(c) => onChange("dashboard_bg_colour", c)} presets={BG_PRESETS} />
          <ColorPicker label="Dashboard bar" value={form.dashboard_bar_colour} onChange={(c) => onChange("dashboard_bar_colour", c)} presets={BG_PRESETS} />
        </div>
      </SectionToggle>

      {/* Typography */}
      <SectionToggle label="Typography" open={openSections.typography} onToggle={() => toggle("typography")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 4 }}>
          <div>
            <label className="block text-[13px] font-medium text-th-secondary" style={{ marginBottom: 6 }}>Heading font</label>
            <select
              value={form.heading_font}
              onChange={(e) => onChange("heading_font", e.target.value)}
              className="w-full h-10 rounded-lg border border-th-border bg-th-surface px-3 text-sm text-th-text outline-none focus:border-th-border focus:ring-2 focus:ring-th-border-light transition-colors"
              style={{ fontFamily: `'${form.heading_font}', serif` }}
            >
              {HEADING_FONTS.map((f) => (
                <option key={f} value={f} className="bg-th-surface text-th-text">{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-th-secondary" style={{ marginBottom: 6 }}>Body font</label>
            <select
              value={form.body_font}
              onChange={(e) => onChange("body_font", e.target.value)}
              className="w-full h-10 rounded-lg border border-th-border bg-th-surface px-3 text-sm text-th-text outline-none focus:border-th-border focus:ring-2 focus:ring-th-border-light transition-colors"
              style={{ fontFamily: `'${form.body_font}', sans-serif` }}
            >
              {BODY_FONTS.map((f) => (
                <option key={f} value={f} className="bg-th-surface text-th-text">{f}</option>
              ))}
            </select>
          </div>
        </div>
      </SectionToggle>

      <div style={{ marginTop: 16 }}>
        {error && <Alert variant="error" className="mb-3">{error}</Alert>}
        <Button type="submit" fullWidth accent={accent}>
          {saved ? "Saved" : "Save branding"}
        </Button>
      </div>
    </form>
  );
}
