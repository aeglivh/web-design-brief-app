import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/lib/supabase";
import { ThemeProvider } from "@/lib/theme";
import "@/styles/globals.css";

// Secret bypass key — visit /login?key=briefflow-admin to access the real app
const BYPASS_KEY = "briefflow-admin";
const BYPASS_STORAGE_KEY = "bf_bypass";

function hasBypass() {
  return sessionStorage.getItem(BYPASS_STORAGE_KEY) === "1";
}

// Waitlist mode — all auth/dashboard routes blocked unless bypass is set
const WaitlistPage = React.lazy(
  () => import("@/features/waitlist/pages/WaitlistPage")
);
const LoginPage = React.lazy(
  () => import("@/features/auth/pages/LoginPage")
);
const DashboardPage = React.lazy(
  () => import("@/features/dashboard/pages/DashboardPage")
);
const IntakeFormPage = React.lazy(
  () => import("@/features/intake/pages/IntakeFormPage")
);

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--th-bg)" }}>
      <div className="w-6 h-6 rounded-full animate-spin" style={{ border: "2px solid var(--th-border)", borderTopColor: "var(--th-text-secondary)" }} />
    </div>
  );
}

function Root() {
  const session = useAuth();
  if (hasBypass()) {
    if (session === undefined) return <Loading />;
    if (session) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  return <WaitlistPage />;
}

function LoginGate() {
  const [params] = useSearchParams();
  // Check for bypass key in URL — store it for the session
  if (params.get("key") === BYPASS_KEY) {
    sessionStorage.setItem(BYPASS_STORAGE_KEY, "1");
  }
  if (hasBypass()) return <LoginPage />;
  return <Navigate to="/" replace />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useAuth();
  if (!hasBypass()) return <Navigate to="/" replace />;
  if (session === undefined) return <Loading />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <React.StrictMode>
      <ThemeProvider>
      <BrowserRouter>
        <React.Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<LoginGate />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/studio/:slug" element={<IntakeFormPage />} />
            {/* Catch-all → waitlist */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

// Mount app
const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}
