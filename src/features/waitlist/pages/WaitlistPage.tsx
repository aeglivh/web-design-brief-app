import { useState, useEffect, useCallback, useRef } from "react";
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
  const [showInfo, setShowInfo] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Animate border glow
  useEffect(() => {
    let angle = 0;
    let raf: number;
    const step = () => {
      angle = (angle + 0.4) % 360;
      cardRef.current?.style.setProperty("--glow-angle", `${angle}deg`);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

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
      .catch(() => setSpotCount(0));
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

      {/* Main card — animated gradient border */}
      <div
        ref={cardRef}
        className="card-glow-border relative z-10 w-full max-w-[680px] rounded-3xl"
        style={{ animation: "enter 0.6s ease-out" }}
      >
        <div
          className="card-inner rounded-3xl p-10 sm:p-16"
          style={{ background: "var(--th-glass-bg), var(--th-bg)", backdropFilter: "blur(28px)" }}
        >
          {/* Logo */}
          <div className="flex justify-center" style={{ marginBottom: 32 }}>
            <div className="flex items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 512 512" fill="none">
                <defs>
                  <linearGradient id="pt" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#818cf8"/>
                    <stop offset="100%" stopColor="#6366f1"/>
                  </linearGradient>
                  <linearGradient id="pm" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#4f46e5"/>
                  </linearGradient>
                </defs>
                <path d="M96 340 L256 420 L416 340 L256 260Z" fill="#312e81" opacity="0.7"/>
                <path d="M96 280 L256 360 L416 280 L256 200Z" fill="url(#pm)" opacity="0.75"/>
                <path d="M96 220 L256 300 L416 220 L256 140Z" fill="url(#pt)"/>
                <path d="M96 220 L256 300 L256 140Z" fill="white" opacity="0.08"/>
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1
            className="text-center text-[52px] sm:text-[72px] font-semibold tracking-[-0.03em] leading-[1.05]"
            style={{ color: "var(--th-text)", marginBottom: 24 }}
          >
            Join the waitlist
          </h1>

          {/* Subtitle line 1 */}
          <p
            className="text-center text-[15px] sm:text-[16px] leading-relaxed"
            style={{ color: "var(--th-text-secondary)" }}
          >
            Client briefs, AI-powered quotes, and contracts.
          </p>
          {/* Subtitle line 2 */}
          <p
            className="text-center text-[15px] sm:text-[16px] leading-relaxed"
            style={{ color: "var(--th-text-secondary)", marginBottom: 24 }}
          >
            All in one platform for web designers.
          </p>

          {/* Incentive */}
          <p
            className="text-center text-[14px] sm:text-[15px] font-medium"
            style={{ color: isDark ? "#a5b4fc" : "#6366f1", marginBottom: 40 }}
          >
            Early birds get 6 months free access
          </p>

          {/* Countdown */}
          {!countdown.expired && (
            <>
              <p
                className="text-center text-[13px] uppercase tracking-[0.15em]"
                style={{ color: "var(--th-text-muted)", marginBottom: 16 }}
              >
                You have
              </p>
              <div className="flex items-center justify-center gap-1" style={{ marginBottom: 48 }}>
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
            </>
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
                <strong style={{ color: isDark ? "#a5b4fc" : "#6366f1" }}>6 months free</strong> for early birds.
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
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="flex gap-4">
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
            </div>
          )}
          {/* Easter egg */}
          <button
            onClick={() => setShowInfo(true)}
            className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-opacity duration-300"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              color: "var(--th-text-muted)",
              fontSize: 11,
              animation: "hint-pulse 6s ease-in-out infinite",
            }}
            title="What is this?"
          >
            ?
          </button>
        </div>
      </div>

      {/* Curtain modal */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={() => setShowInfo(false)}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{
              backgroundColor: "var(--th-overlay)",
              animation: "fade-in 0.3s ease-out",
            }}
          />
          {/* Curtain panel */}
          <div
            className="relative w-full max-w-[680px] mx-auto px-5"
            style={{
              animation: "curtain-drop 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-b-3xl p-8 sm:p-14"
              style={{
                background: "var(--th-glass-bg), var(--th-bg)",
                backdropFilter: "blur(28px)",
                borderLeft: "1px solid var(--th-border)",
                borderRight: "1px solid var(--th-border)",
                borderBottom: "1px solid var(--th-border)",
              }}
            >
              {/* Close */}
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-5 right-5 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--th-text-secondary)" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <p
                className="text-[13px] uppercase tracking-[0.15em] font-medium"
                style={{ color: "var(--th-text-muted)", marginBottom: 24 }}
              >
                What's inside
              </p>
              <div className="flex items-center gap-4" style={{ marginBottom: 20 }}>
                <svg width="48" height="48" viewBox="0 0 512 512" fill="none">
                  <defs>
                    <linearGradient id="mpt" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#818cf8"/>
                      <stop offset="100%" stopColor="#6366f1"/>
                    </linearGradient>
                    <linearGradient id="mpm" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1"/>
                      <stop offset="100%" stopColor="#4f46e5"/>
                    </linearGradient>
                  </defs>
                  <path d="M96 340 L256 420 L416 340 L256 260Z" fill="#312e81" opacity="0.7"/>
                  <path d="M96 280 L256 360 L416 280 L256 200Z" fill="url(#mpm)" opacity="0.75"/>
                  <path d="M96 220 L256 300 L416 220 L256 140Z" fill="url(#mpt)"/>
                  <path d="M96 220 L256 300 L256 140Z" fill="white" opacity="0.08"/>
                </svg>
                <h2
                  className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em] leading-[1.15]"
                  style={{ color: "var(--th-text)" }}
                >
                  debrieft
                </h2>
              </div>
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: "var(--th-text-secondary)", marginBottom: 32 }}
              >
                Turn client intake into structured briefs, AI-powered quotes, and ready-to-sign contracts. No more back-and-forth.
              </p>

              <div
                className="grid grid-cols-1 sm:grid-cols-2"
                style={{
                  borderTop: "1px solid var(--th-border)",
                  paddingTop: 24,
                  gap: 16,
                }}
              >
                {[
                  { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", title: "Client intake forms", desc: "Branded questionnaires your clients fill out. You set the questions, they provide the answers." },
                  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "AI-generated briefs", desc: "Raw client responses are automatically turned into structured, actionable design briefs." },
                  { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Instant quotes", desc: "Set your hourly rates once. The AI scopes the work and generates a quote automatically." },
                  { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", title: "Contract generation", desc: "One click from quote to contract. Ready to send, ready to sign." },
                ].map((item) => (
                  <div key={item.title} style={{ padding: 16 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12, opacity: 0.55 }}>
                      <path d={item.icon} />
                    </svg>
                    <p className="text-[14px] font-semibold" style={{ color: "var(--th-text)", marginBottom: 4 }}>{item.title}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--th-text-secondary)" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
