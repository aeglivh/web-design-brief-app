import { isLight } from "@/lib/utils";
import type { BrandingState } from "./BrandingForm";

interface BrandingPreviewProps {
  form: BrandingState;
}

export function BrandingPreview({ form }: BrandingPreviewProps) {
  const barLight = isLight(form.dashboard_bar_colour);
  const dashLight = isLight(form.dashboard_bg_colour);
  const formLight = isLight(form.form_bg_colour);
  const barText = barLight ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.9)";
  const barMuted = barLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
  const dashText = dashLight ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.9)";
  const dashMuted = dashLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";
  const dashBorder = dashLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)";
  const dashSurface = dashLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)";
  const formText = formLight ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)";
  const formMuted = formLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
  const formBorder = formLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const formInput = formLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)";

  return (
    <div>
      <h2 className="text-[20px] font-light tracking-[-0.02em] text-th-text" style={{ marginBottom: 8 }}>
        Branding Preview
      </h2>
      <p className="text-[13px] text-th-muted leading-relaxed" style={{ marginBottom: 28 }}>
        These previews update live as you change settings in the sidebar. The dashboard preview shows your top bar and content area. The client form preview shows what clients see when filling out the intake form at your studio link.
      </p>

      <p className="text-[11px] font-medium text-th-muted uppercase tracking-[0.12em]" style={{ marginBottom: 12 }}>Dashboard</p>

      {/* Dashboard bar preview */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid var(--th-border)" }}>
        <div
          className="flex items-center justify-between px-4 h-11"
          style={{
            backgroundColor: form.dashboard_bar_colour,
            borderBottom: `1px solid ${barLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <div className="flex items-center gap-2.5">
            {form.logo_url ? (
              <img src={form.logo_url} alt="" className="w-6 h-6 rounded-md object-contain" />
            ) : (
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: form.accent_color }}
              >
                {(form.studio_name || "S").charAt(0)}
              </div>
            )}
            <span
              className="text-[12px] font-medium"
              style={{ color: barText, fontFamily: `'${form.heading_font}', sans-serif` }}
            >
              {form.studio_name || "Your Studio"}
            </span>
            {form.slug && (
              <span className="text-[10px] font-mono" style={{ color: barMuted }}>
                /{form.slug}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px]" style={{ color: barMuted }}>Share</span>
            <span className="text-[10px]" style={{ color: barMuted }}>Preview</span>
          </div>
        </div>

        {/* Simulated content area */}
        <div className="p-5" style={{ backgroundColor: form.dashboard_bg_colour }}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[14px] font-light"
              style={{ color: dashText, fontFamily: `'${form.heading_font}', sans-serif` }}
            >
              Client Briefs
            </span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: dashSurface, color: dashMuted }}
            >
              3
            </span>
          </div>
          {/* Mini brief cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1"
              style={{ border: `1px solid ${dashBorder}` }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ backgroundColor: form.accent_color, opacity: 1 - (i - 1) * 0.15 }}
              >
                {["A", "M", "J"][i - 1]}
              </div>
              <div className="flex-1">
                <div className="h-2 rounded-full mb-1" style={{ width: `${70 - i * 10}%`, backgroundColor: dashSurface }} />
                <div className="h-1.5 rounded-full" style={{ width: `${50 - i * 5}%`, backgroundColor: dashBorder }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client form preview */}
      <p className="text-[11px] font-medium text-th-muted uppercase tracking-[0.12em]" style={{ marginTop: 32, marginBottom: 12 }}>Client form</p>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--th-border)" }}>
        <div
          className="p-6"
          style={{ backgroundColor: form.form_bg_colour }}
        >
          {/* Form header */}
          <div className="flex items-center gap-2.5 mb-5">
            {form.logo_url ? (
              <img src={form.logo_url} alt="" className="w-7 h-7 rounded-lg object-contain" />
            ) : (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: form.accent_color }}
              >
                {(form.studio_name || "S").charAt(0)}
              </div>
            )}
            <div>
              <p
                className="text-[13px] font-semibold leading-tight"
                style={{ color: formText, fontFamily: `'${form.heading_font}', sans-serif` }}
              >
                {form.studio_name || "Your Studio"}
              </p>
              {form.tagline && (
                <p
                  className="text-[10px] leading-tight"
                  style={{ color: formMuted, fontFamily: `'${form.body_font}', sans-serif` }}
                >
                  {form.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Fake form step */}
          <p
            className="text-[15px] font-semibold mb-1"
            style={{ color: formText, fontFamily: `'${form.heading_font}', sans-serif` }}
          >
            Business & Goals
          </p>
          <p className="text-[11px] mb-4" style={{ color: formMuted, fontFamily: `'${form.body_font}', sans-serif` }}>
            Tell us about your business and project.
          </p>

          {/* Mock inputs */}
          {["Business name", "Industry"].map((label) => (
            <div key={label} className="mb-3">
              <p
                className="text-[11px] font-medium mb-1"
                style={{ color: formMuted, fontFamily: `'${form.body_font}', sans-serif` }}
              >
                {label}
              </p>
              <div
                className="h-9 rounded-lg"
                style={{ backgroundColor: formInput, border: `1px solid ${formBorder}` }}
              />
            </div>
          ))}

          {/* Progress bar */}
          <div className="flex gap-1 mt-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 h-[3px] rounded-full"
                style={{ backgroundColor: i === 1 ? form.accent_color : formBorder }}
              />
            ))}
          </div>

          {/* Button */}
          <button
            type="button"
            className="w-full h-9 rounded-lg text-[12px] font-medium mt-4 cursor-default"
            style={{
              backgroundColor: form.accent_color,
              color: isLight(form.accent_color) ? "rgba(0,0,0,0.85)" : "#fff",
            }}
          >
            Next step
          </button>
        </div>
      </div>
    </div>
  );
}
