import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "@/lib/api";

// Lazy imports for code splitting
import { lazy, Suspense } from "react";
const IntakeFormPage = lazy(() => import("@/features/intake/pages/IntakeFormPage"));
const PortalPage = lazy(() => import("@/features/portal/PortalPage"));

function Loading() {
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

/**
 * Checks if a portal exists for this slug (brief with portal_status beyond intake_complete).
 * If yes → PortalPage. If no → IntakeFormPage.
 */
export default function StudioRoute() {
  const { slug } = useParams<{ slug: string }>();
  const [mode, setMode] = useState<"loading" | "portal" | "intake">("loading");

  useEffect(() => {
    if (!slug) {
      setMode("intake");
      return;
    }
    fetch(`${API_BASE}/api/portal?slug=${slug}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((json) => {
        // Show portal if paused OR if portal_status has progressed beyond intake_complete
        if (json.paused || (json.brief && json.brief.portal_status !== "intake_complete")) {
          setMode("portal");
        } else {
          setMode("intake");
        }
      })
      .catch(() => {
        // No brief found or error — show intake form
        setMode("intake");
      });
  }, [slug]);

  if (mode === "loading") return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      {mode === "portal" ? <PortalPage /> : <IntakeFormPage />}
    </Suspense>
  );
}
