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

const FEATURES = [
  "Smart intake forms",
  "AI-generated briefs",
  "Instant quotes",
  "White-label branding",
  "Contract generation",
];

export default function WaitlistPage() {
  const { isDark, toggle } = useTheme();
  const countdown = useCountdown(WAITLIST_CLOSES);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [spotCount, setSpotCount] = useState<number | null>(null);

  // Hide Vercel toolbar if injected
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = "vercel-live-feedback { display: none !important; }";
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/waitlist`)
      .then((r) => r.ok ? r.json() : Promise.reject())
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
      if (!res.ok) {
        const text = await res.text();
        let msg = "Something went wrong";
        try { msg = JSON.parse(text).error || msg; } catch { /* not JSON */ }
        throw new Error(msg);
      }
      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
        setSpotCount((c) => (c !== null ? c + 1 : 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  };

  const inputStyle = {
    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
    color: "var(--th-text)",
  };

  return (
    <div
      className="h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "var(--th-bg)" }}
    >
      {/* Background orbs */}
      <div
        className="absolute pointer-events-none"
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
        className="absolute pointer-events-none"
        style={{
          width: 500, height: 500,
          bottom: "-10%", right: "-5%",
          background: isDark
            ? "radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)",
          animation: "float-2 15s ease-in-out infinite",
        }}
      />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 z-20"
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

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-xl text-center"
        style={{ animation: "enter 0.6s ease-out" }}
      >
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-10"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 8px 24px -6px rgba(99,102,241,0.5)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-[48px] sm:text-[64px] font-semibold tracking-[-0.04em] leading-[1.05] mb-5"
          style={{ color: "var(--th-text)" }}
        >
          Something new
          <br />
          is coming
        </h1>

        <p className="text-[17px] sm:text-[19px] max-w-md mx-auto mb-12 leading-relaxed" style={{ color: "var(--th-text-muted)" }}>
          Client briefs, AI-powered quotes, and contracts — all in one
          white-label platform for web designers.
        </p>

        {/* Countdown */}
        {!countdown.expired && (
          <div className="flex items-center justify-center gap-8 mb-12">
            {[
              { value: countdown.days, label: "days" },
              { value: countdown.hours, label: "hours" },
              { value: countdown.minutes, label: "min" },
              { value: countdown.seconds, label: "sec" },
            ].map((unit) => (
              <div key={unit.label} className="flex flex-col items-center">
                <span
                  className="text-[40px] sm:text-[48px] font-light tabular-nums tracking-[-0.02em] leading-none"
                  style={{ color: "var(--th-text)" }}
                >
                  {String(unit.value).padStart(2, "0")}
                </span>
                <span className="text-[11px] uppercase tracking-[0.12em] mt-2" style={{ color: "var(--th-text-muted)" }}>
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Form / Success / Expired */}
        {success ? (
          <div className="mb-12">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #34d399, #10b981)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[18px] font-semibold mb-2" style={{ color: "var(--th-text)" }}>
              You're on the list!
            </p>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--th-text-muted)" }}>
              We'll notify you at launch.{" "}
              <strong style={{ color: "var(--th-text)" }}>3-6 months free</strong> for early supporters.
            </p>
            {spotCount !== null && (
              <p className="text-[13px] font-mono mt-3" style={{ color: "var(--th-text-muted)" }}>
                #{spotCount} on the waitlist
              </p>
            )}
          </div>
        ) : countdown.expired ? (
          <div className="mb-12">
            <p className="text-[17px] font-medium" style={{ color: "var(--th-text)" }}>
              The waitlist is now closed.
            </p>
            <p className="text-[15px] mt-2" style={{ color: "var(--th-text-muted)" }}>
              Stay tuned for our launch.
            </p>
          </div>
        ) : (
          <div className="mb-12">
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="h-12 rounded-xl px-5 text-[14px] outline-none transition-all duration-200 sm:w-[140px]"
                style={inputStyle}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="h-12 rounded-xl px-5 text-[14px] outline-none transition-all duration-200 flex-1"
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="h-12 px-7 rounded-xl text-[14px] font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "white",
                  boxShadow: "0 4px 16px -4px rgba(99,102,241,0.5)",
                  border: "none",
                }}
              >
                {loading ? "Joining..." : "Join waitlist"}
              </button>
            </form>
            <p className="text-[13px] mt-4" style={{ color: "var(--th-text-muted)" }}>
              Early supporters get <strong style={{ color: isDark ? "#a5b4fc" : "#6366f1" }}>3-6 months free</strong> when we launch.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
          {FEATURES.map((f, i) => (
            <span key={f} className="text-[13px]" style={{ color: "var(--th-text-muted)" }}>
              {i > 0 && <span className="mr-5" style={{ opacity: 0.3 }}>·</span>}
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
