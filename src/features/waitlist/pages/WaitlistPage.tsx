import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme";
import { API_BASE } from "@/lib/api";
import { Alert } from "@/components/ui";

const WAITLIST_CLOSES = new Date("2026-03-20T23:59:59Z");

function useCountdown(target: Date) {
  const calc = useCallback(() => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: diff <= 0,
    };
  }, [target]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

export default function WaitlistPage() {
  const { isDark, toggle } = useTheme();
  const countdown = useCountdown(WAITLIST_CLOSES);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [spotCount, setSpotCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/waitlist`)
      .then((r) => r.json())
      .then((d) => setSpotCount(d.count || 0))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSuccess(true);
      setSpotCount((c) => (c !== null ? c + 1 : 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  };

  const inputStyle = {
    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    color: "var(--th-text)",
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: "var(--th-bg)" }}
    >
      {/* Animated background orbs */}
      <div
        className="fixed pointer-events-none"
        style={{
          width: 600, height: 600,
          top: "-15%", left: "-10%",
          background: isDark
            ? "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
          animation: "float-1 12s ease-in-out infinite",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          width: 500, height: 500,
          bottom: "-10%", right: "-5%",
          background: isDark
            ? "radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)",
          animation: "float-2 15s ease-in-out infinite",
        }}
      />

      {/* Noise texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Theme toggle — top right */}
      <button
        onClick={toggle}
        className="fixed top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 z-20"
        style={{
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        }}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--th-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {isDark ? (
            <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>
          ) : (
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          )}
        </svg>
      </button>

      {/* ───── Hero Section ───── */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16 relative z-10">
        <div
          className="w-full max-w-lg text-center px-6"
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--th-icon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          {/* Title */}
          <h1
            className="text-[40px] sm:text-[56px] font-light tracking-[-0.04em] leading-[1.1] mb-4"
            style={{
              background: isDark
                ? "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 100%)"
                : "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Something new is coming
          </h1>

          {/* Tagline */}
          <p className="text-[16px] sm:text-[18px] font-light tracking-[-0.01em] max-w-md mx-auto mb-10 leading-relaxed" style={{ color: "var(--th-text-muted)" }}>
            Client briefs, AI-powered quotes, and contracts — all in one
            white-label platform for web designers.
          </p>

          {/* Countdown */}
          {!countdown.expired && (
            <div
              className="flex items-center justify-center gap-4 mb-10"
              style={{ animation: "enter 0.6s ease-out 0.1s both" }}
            >
              {[
                { value: countdown.days, label: "days" },
                { value: countdown.hours, label: "hrs" },
                { value: countdown.minutes, label: "min" },
                { value: countdown.seconds, label: "sec" },
              ].map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                  <span
                    className="text-[28px] sm:text-[36px] font-light tabular-nums tracking-[-0.02em]"
                    style={{ color: "var(--th-text)" }}
                  >
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.1em] mt-0.5" style={{ color: "var(--th-text-muted)" }}>
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Waitlist form or success */}
          <div style={{ animation: "enter 0.6s ease-out 0.2s both" }}>
            {success ? (
              <div
                className="rounded-2xl p-8"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)"
                    : "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)",
                  backdropFilter: "blur(40px)",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.6)",
                  boxShadow: isDark
                    ? "0 32px 64px -16px rgba(0,0,0,0.6)"
                    : "0 32px 64px -16px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #34d399, #10b981)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] mb-2" style={{ color: "var(--th-text)" }}>
                  You're on the list!
                </h2>
                <p className="text-[14px] leading-relaxed mb-4" style={{ color: "var(--th-text-muted)" }}>
                  We'll notify you when we launch. As an early supporter, you'll get{" "}
                  <strong style={{ color: "var(--th-text)" }}>3-6 months free access</strong>{" "}
                  to the full platform.
                </p>
                {spotCount !== null && (
                  <p className="text-[13px] font-mono" style={{ color: "var(--th-text-muted)" }}>
                    #{spotCount} on the waitlist
                  </p>
                )}
              </div>
            ) : countdown.expired ? (
              <div
                className="rounded-2xl p-8"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <p className="text-[16px] font-medium" style={{ color: "var(--th-text)" }}>
                  The waitlist is now closed.
                </p>
                <p className="text-[14px] mt-2" style={{ color: "var(--th-text-muted)" }}>
                  Stay tuned for our launch announcement.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && <Alert variant="error">{error}</Alert>}

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-12 rounded-xl px-4 text-[14px] outline-none transition-all duration-200 sm:w-2/5"
                    style={inputStyle}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@studio.com"
                    className="h-12 rounded-xl px-4 text-[14px] outline-none transition-all duration-200 flex-1"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-12 rounded-xl text-[14px] font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                    color: "white",
                    boxShadow: "0 4px 16px -4px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                    border: "none",
                  }}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Joining...
                    </span>
                  ) : "Join the waitlist"}
                </button>

                <p className="text-[12px] pt-1" style={{ color: "var(--th-text-muted)" }}>
                  Early supporters get <strong style={{ color: isDark ? "#a5b4fc" : "#6366f1" }}>3-6 months free</strong> when we launch. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Feature pills */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-3 px-6"
          style={{ animation: "enter 0.6s ease-out 0.3s both" }}
        >
          {[
            { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Smart intake forms" },
            { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", label: "AI-generated briefs" },
            { icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", label: "Instant quotes" },
            { icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", label: "White-label branding" },
            { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Contract generation" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                border: "1px solid var(--th-border-light)",
                backgroundColor: "var(--th-surface)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--th-text-muted)" }}>
                <path d={feature.icon} />
              </svg>
              <span className="text-[12px] font-medium" style={{ color: "var(--th-text-muted)" }}>
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ───── App Preview Section ───── */}
      <section className="relative z-10 px-4 pb-24">
        <div className="text-center mb-8" style={{ animation: "enter 0.6s ease-out 0.4s both" }}>
          <p className="text-[13px] uppercase tracking-[0.12em] font-medium" style={{ color: "var(--th-text-muted)" }}>
            Sneak peek
          </p>
        </div>

        {/* Login card preview — non-interactive, dimmed */}
        <div
          className="max-w-[440px] mx-auto relative select-none"
          style={{ animation: "enter 0.6s ease-out 0.5s both" }}
        >
          {/* Glow behind card */}
          <div
            className="absolute -inset-px rounded-[25px] pointer-events-none"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.1), rgba(59,130,246,0.15))"
                : "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(236,72,153,0.06), rgba(59,130,246,0.1))",
              filter: "blur(1px)",
            }}
          />

          <div
            className="relative rounded-[24px] pointer-events-none"
            style={{
              padding: "48px",
              background: isDark
                ? "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)"
                : "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)",
              backdropFilter: "blur(40px) saturate(1.4)",
              WebkitBackdropFilter: "blur(40px) saturate(1.4)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(255,255,255,0.6)",
              boxShadow: isDark
                ? "0 32px 64px -16px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.06)"
                : "0 32px 64px -16px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 0 rgba(255,255,255,0.8)",
            }}
          >
            {/* Inner highlight */}
            <div
              className="absolute inset-0 rounded-[24px] pointer-events-none"
              style={{
                background: isDark
                  ? "radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.08) 0%, transparent 50%)"
                  : "radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.05) 0%, transparent 50%)",
              }}
            />

            {/* Header: Logo */}
            <div className="relative flex items-center justify-between mb-10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    boxShadow: "0 4px 12px -2px rgba(99,102,241,0.4)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-[14px] font-semibold tracking-[-0.01em]" style={{ color: "var(--th-text)" }}>Briefflow</span>
              </div>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--th-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="relative">
              <h2
                className="text-[32px] font-semibold tracking-[-0.03em] mb-3"
                style={{ color: "var(--th-text)" }}
              >
                Welcome back
              </h2>
              <p className="text-[14px] mb-10 leading-relaxed" style={{ color: "var(--th-text-muted)" }}>
                Sign in to manage your studio.
              </p>
            </div>

            {/* Fake tabs */}
            <div className="flex gap-1 mb-10 p-1 rounded-xl" style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            }}>
              <div
                className="flex-1 py-2 text-[13px] font-medium text-center rounded-lg"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)",
                  color: "var(--th-text)",
                  boxShadow: isDark
                    ? "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                    : "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                Sign in
              </div>
              <div className="flex-1 py-2 text-[13px] font-medium text-center rounded-lg" style={{ color: "var(--th-text-muted)" }}>
                Sign up
              </div>
            </div>

            {/* Fake form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div>
                <div className="text-[13px] font-medium mb-3" style={{ color: "var(--th-text-secondary)" }}>Email</div>
                <div
                  className="w-full h-12 rounded-xl px-4 flex items-center text-[14px]"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    color: "var(--th-text-muted)",
                  }}
                >
                  you@studio.com
                </div>
              </div>
              <div>
                <div className="text-[13px] font-medium mb-3" style={{ color: "var(--th-text-secondary)" }}>Password</div>
                <div
                  className="w-full h-12 rounded-xl px-4 flex items-center text-[14px]"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    color: "var(--th-text-muted)",
                  }}
                >
                  Enter password
                </div>
              </div>
            </div>

            {/* Fake CTA */}
            <div
              className="w-full h-12 rounded-xl flex items-center justify-center text-[14px] font-semibold mt-9"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                color: "white",
                boxShadow: "0 4px 16px -4px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              Sign in
            </div>

            <p className="text-center text-[13px] mt-8" style={{ color: "var(--th-text-muted)" }}>
              No account?{" "}
              <span className="font-semibold" style={{ color: isDark ? "#a5b4fc" : "#6366f1" }}>
                Create one
              </span>
            </p>
          </div>

          {/* Frosted overlay with CTA */}
          <div
            className="absolute inset-0 rounded-[24px] flex flex-col items-center justify-end pb-16 z-10"
            style={{
              background: isDark
                ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 100%)"
                : "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.85) 100%)",
              backdropFilter: "blur(1px)",
            }}
          >
            <p className="text-[14px] font-medium mb-3" style={{ color: "var(--th-text)" }}>
              Join the waitlist to get early access
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="h-10 px-6 rounded-xl text-[13px] font-semibold cursor-pointer transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                border: "none",
                boxShadow: "0 4px 12px -2px rgba(99,102,241,0.4)",
              }}
            >
              Scroll up to join
            </button>
          </div>
        </div>
      </section>

      {/* Bottom fade line */}
      <div className="fixed bottom-0 left-0 right-0 h-px z-10" style={{ background: "linear-gradient(to right, transparent, var(--th-border-light), transparent)" }} />
    </div>
  );
}
