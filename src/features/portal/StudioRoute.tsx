import { useParams } from "react-router-dom";
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
 * /studio/:slug         → Intake form (public)
 * /studio/:slug/:briefId → Client portal for that specific brief
 */
export default function StudioRoute() {
  const { briefId } = useParams<{ slug: string; briefId: string }>();

  return (
    <Suspense fallback={<Loading />}>
      {briefId ? <PortalPage /> : <IntakeFormPage />}
    </Suspense>
  );
}
