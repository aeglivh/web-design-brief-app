import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/lib/supabase";
import { ThemeProvider } from "@/lib/theme";
import "@/styles/globals.css";

// Lazy load pages for code splitting
const SplashPage = React.lazy(
  () => import("@/features/splash/pages/SplashPage")
);
const LoginPage = React.lazy(
  () => import("@/features/auth/pages/LoginPage")
);
const DashboardPage = React.lazy(
  () => import("@/features/dashboard/pages/DashboardPage")
);
const StudioRoute = React.lazy(
  () => import("@/features/portal/StudioRoute")
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
  if (session === undefined) return <Loading />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useAuth();
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
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/studio/:slug" element={<StudioRoute />} />
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
