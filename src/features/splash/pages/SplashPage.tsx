import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/lib/supabase";
import { useTheme } from "@/lib/theme";
import { useEffect } from "react";

export default function SplashPage() {
  const navigate = useNavigate();
  const session = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    if (session) navigate("/dashboard", { replace: true });
  }, [session, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "var(--th-bg)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.03) 40%, transparent 70%)"
            : "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center px-6"
        style={{ animation: "enter 0.6s ease-out" }}
      >
        {/* Logo mark */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm"
          style={{
            backgroundColor: "var(--th-surface)",
            border: "1px solid var(--th-border)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--th-icon)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-[48px] sm:text-[64px] font-light tracking-[-0.04em] leading-[1.1] mb-4"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Briefflow
        </h1>

        {/* Tagline */}
        <p className="text-[16px] sm:text-[18px] font-light tracking-[-0.01em] max-w-md mx-auto mb-12 leading-relaxed" style={{ color: "var(--th-text-muted)" }}>
          Client briefs, AI-powered quotes, and contracts — all in one
          white-label platform for web designers.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="h-11 px-8 rounded-full text-[14px] font-medium cursor-pointer transition-all hover:brightness-125 active:brightness-90"
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.2) 100%)",
              border: "1px solid rgba(59,130,246,0.3)",
              backdropFilter: "blur(12px)",
              color: "var(--th-text)",
            }}
          >
            Get started
          </button>
          <button
            onClick={() => navigate("/login")}
            className="h-11 px-8 rounded-full text-[14px] font-medium cursor-pointer transition-all"
            style={{
              background: "transparent",
              border: "1px solid var(--th-border)",
              color: "var(--th-text-secondary)",
            }}
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Feature pills */}
      <div
        className="relative z-10 mt-20 flex flex-wrap items-center justify-center gap-3 px-6"
        style={{ animation: "enter 0.6s ease-out 0.15s both" }}
      >
        {[
          { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Smart intake forms" },
          { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", label: "AI-generated briefs" },
          { icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", label: "Instant quotes" },
          { icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", label: "White-label branding" },
        ].map((feature) => (
          <div
            key={feature.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              border: "1px solid var(--th-border-light)",
              backgroundColor: "var(--th-surface)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--th-text-muted)" }}
            >
              <path d={feature.icon} />
            </svg>
            <span className="text-[12px] font-medium" style={{ color: "var(--th-text-muted)" }}>
              {feature.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom fade line */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, var(--th-border-light), transparent)` }} />
    </div>
  );
}
