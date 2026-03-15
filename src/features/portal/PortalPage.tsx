import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePortalData } from "./usePortalData";
import { PortalPaused } from "./PortalPaused";
import { PortalProgress } from "./PortalProgress";
import { PortalPhases } from "./PortalPhases";
import { PortalDocuments } from "./PortalDocuments";
import { PortalTimeline } from "./PortalTimeline";

export default function PortalPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, pausedData, loading, notFound } = usePortalData(slug);

  const designer = data?.designer;
  const headingFont = designer?.heading_font || "Inter";
  const bodyFont = designer?.body_font || "Inter";

  // Dynamically load Google Fonts
  useEffect(() => {
    const fonts = new Set([headingFont, bodyFont].filter((f) => f && f !== "Inter"));
    if (fonts.size === 0) return;
    const families = [...fonts]
      .map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`)
      .join("&");
    const id = "branding-fonts";
    if (document.getElementById(id)) document.getElementById(id)!.remove();
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }, [headingFont, bodyFont]);

  // Loading
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--th-bg)" }}
      >
        <div
          className="w-6 h-6 rounded-full animate-spin"
          style={{ border: "2px solid var(--th-border)", borderTopColor: "var(--th-text-muted)" }}
        />
      </div>
    );
  }

  // Not found
  if (notFound) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: "var(--th-bg)" }}
      >
        <p className="text-[14px]" style={{ color: "var(--th-text-muted)" }}>
          Project not found.
        </p>
      </div>
    );
  }

  // Paused
  if (pausedData) {
    return (
      <PortalPaused
        designerName={pausedData.designer_name}
        designerLogo={pausedData.designer_logo}
      />
    );
  }

  if (!data || !designer) return null;

  const accent = designer.accent_color || "#6366f1";
  const brief = data.brief;
  const projectName = brief.business_name || brief.client_name || "Your Project";

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--th-bg)",
        fontFamily: `'${bodyFont}', sans-serif`,
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "40px 20px 60px",
        }}
      >
        {/* Header card */}
        <div
          className="rounded-[16px]"
          style={{
            border: "1px solid var(--th-border-light)",
            background: "var(--th-surface)",
            padding: "20px 24px",
            marginBottom: 20,
          }}
        >
          <div className="flex items-center" style={{ gap: 12 }}>
            {designer.logo_url ? (
              <img
                src={designer.logo_url}
                alt={designer.studio_name}
                className="object-contain"
                style={{ width: 40, height: 40, borderRadius: 10 }}
              />
            ) : (
              <div
                className="flex items-center justify-center text-white text-[14px] font-bold"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: accent,
                }}
              >
                {(designer.studio_name || "S").charAt(0)}
              </div>
            )}
            <div>
              <p
                className="text-[14px] font-semibold leading-tight"
                style={{
                  color: "var(--th-text)",
                  fontFamily: `'${headingFont}', sans-serif`,
                }}
              >
                {designer.studio_name}
              </p>
              <p
                className="text-[12px] leading-tight"
                style={{ color: "var(--th-text-muted)", marginTop: 2 }}
              >
                {projectName}
              </p>
            </div>
          </div>
        </div>

        {/* Progress stepper */}
        <PortalProgress portalStatus={brief.portal_status} accent={accent} />

        {/* Project phases (from contract milestones) */}
        {(brief.project_phases?.length || data.contract?.contract_data) && (
          <PortalPhases
            milestones={
              ((data.contract?.contract_data as { timeline?: { milestones?: Array<{ phase: string; weeks: string; deliverable: string }> } })?.timeline?.milestones) || []
            }
            projectPhases={brief.project_phases}
            portalStatus={brief.portal_status}
            accent={accent}
          />
        )}

        {/* Documents (brief, quote, contract) */}
        <PortalDocuments brief={brief} contract={data.contract} accent={accent} />

        {/* Timeline section */}
        <div
          className="rounded-[16px]"
          style={{
            border: "1px solid var(--th-border-light)",
            background: "var(--th-surface)",
            padding: 28,
          }}
        >
          <p
            className="text-[10px] font-medium uppercase"
            style={{
              color: "var(--th-text-muted)",
              letterSpacing: "0.15em",
              marginBottom: 20,
            }}
          >
            Project Updates
          </p>
          <PortalTimeline
            updates={data.updates}
            feedbackUpdateIds={data.feedback_update_ids}
            briefId={brief.id}
            accent={accent}
          />
        </div>
      </div>
    </div>
  );
}
