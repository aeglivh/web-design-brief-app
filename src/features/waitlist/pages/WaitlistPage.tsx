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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden"
      style={{ backgroundColor: "var(--th-bg)" }}
    >
      {/* Background glow orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 700, height: 700,
          top: "-20%", left: "-15%",
          background: isDark
            ? "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)"
            : "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)",
          animation: "float-1 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500, height: 500,
          bottom: "-15%", right: "-10%",
          background: isDark
            ? "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 60%)"
            : "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 60%)",
          animation: "float-2 22s ease-in-out infinite",
        }}
      />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 z-20"
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

      {/* Main card */}
      <div
        className="glass relative z-10 w-full max-w-[520px] rounded-3xl p-10 sm:p-14"
        style={{ animation: "enter 0.6s ease-out" }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 6px 20px -4px rgba(99,102,241,0.5)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-center text-[28px] sm:text-[34px] font-semibold tracking-[-0.03em] leading-[1.15] mb-3"
          style={{ color: "var(--th-text)" }}
        >
          Join the waitlist
        </h1>

        <p
          className="text-center text-[15px] sm:text-[16px] leading-relaxed mb-8 max-w-sm mx-auto"
          style={{ color: "var(--th-text-secondary)" }}
        >
          Client briefs, AI-powered quotes, and contracts — all in one platform for web designers.
        </p>

        {/* Countdown */}
        {!countdown.expired && (
          <div className="flex items-center justify-center gap-1 mb-8">
            {[
              { value: countdown.days, label: "days" },
              { value: countdown.hours, label: "hrs" },
              { value: countdown.minutes, label: "min" },
              { value: countdown.seconds, label: "sec" },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-1">
                {i > 0 && (
                  <span
                    className="text-[24px] sm:text-[28px] font-light mx-1"
                    style={{ color: "var(--th-text-muted)", lineHeight: 1 }}
                  >
                    :
                  </span>
                )}
                <div className="flex flex-col items-center">
                  <div
                    className="w-[60px] sm:w-[68px] h-[52px] sm:h-[58px] rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                    }}
                  >
                    <span
                      className="text-[24px] sm:text-[28px] tabular-nums tracking-[-0.02em] leading-none"
                      style={{ color: "var(--th-text)", fontFamily: "var(--font-mono)" }}
                    >
                      {String(unit.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-[0.1em] mt-1.5"
                    style={{ color: "var(--th-text-muted)" }}
                  >
                    {unit.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form / Success / Expired */}
        {success ? (
          <div className="text-center">
            <div
              className="w-11 h-11 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #34d399, #10b981)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[17px] font-semibold mb-1.5" style={{ color: "var(--th-text)" }}>
              You're on the list!
            </p>
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--th-text-secondary)" }}>
              We'll notify you at launch.{" "}
              <strong style={{ color: isDark ? "#a5b4fc" : "#6366f1" }}>3-6 months free</strong> for early supporters.
            </p>
            {spotCount !== null && (
              <p
                className="text-[12px] mt-3"
                style={{ color: "var(--th-text-muted)", fontFamily: "var(--font-mono)" }}
              >
                #{spotCount} on the waitlist
              </p>
            )}
          </div>
        ) : countdown.expired ? (
          <div className="text-center">
            <p className="text-[16px] font-medium" style={{ color: "var(--th-text)" }}>
              The waitlist is now closed.
            </p>
            <p className="text-[14px] mt-2" style={{ color: "var(--th-text-secondary)" }}>
              Stay tuned for our launch.
            </p>
          </div>
        ) : (
          <div>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="h-12 rounded-xl px-4 text-[14px] outline-none transition-all duration-200 w-[140px] flex-shrink-0"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    color: "var(--th-text)",
                  }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className="h-12 rounded-xl px-4 text-[14px] outline-none transition-all duration-200 flex-1 min-w-0"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    color: "var(--th-text)",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-12 rounded-xl text-[14px] font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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

            {/* Social proof + incentive */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {spotCount !== null && spotCount > 0 && (
                <>
                  {/* Avatar stack */}
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(spotCount, 4))].map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium"
                        style={{
                          background: [
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            "linear-gradient(135deg, #ec4899, #f43f5e)",
                            "linear-gradient(135deg, #14b8a6, #06b6d4)",
                            "linear-gradient(135deg, #f59e0b, #ef4444)",
                          ][i],
                          border: `2px solid ${isDark ? "#15151f" : "#eeeef2"}`,
                          color: "white",
                          zIndex: 4 - i,
                        }}
                      >
                        {["A", "M", "K", "J"][i]}
                      </div>
                    ))}
                  </div>
                  <span className="text-[12px]" style={{ color: "var(--th-text-muted)" }}>
                    {spotCount} designer{spotCount !== 1 ? "s" : ""} joined
                  </span>
                  <span className="text-[12px]" style={{ color: "var(--th-text-muted)", opacity: 0.4 }}>|</span>
                </>
              )}
              <span className="text-[12px]" style={{ color: isDark ? "#a5b4fc" : "#6366f1" }}>
                3-6 months free
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Feature pills — below the card */}
      <div
        className="relative z-10 flex flex-wrap items-center justify-center gap-2 mt-8"
        style={{ animation: "enter 0.6s ease-out 0.15s both" }}
      >
        {FEATURES.map((f) => (
          <span
            key={f}
            className="text-[12px] px-3 py-1 rounded-full"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              color: "var(--th-text-muted)",
            }}
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
