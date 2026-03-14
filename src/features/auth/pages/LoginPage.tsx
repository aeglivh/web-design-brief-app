import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, useAuth } from "@/features/auth/lib/supabase";
import { useTheme } from "@/lib/theme";
import { Alert } from "@/components/ui";

function checkStrength(pw: string) {
  return {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

const REQS: { key: keyof ReturnType<typeof checkStrength>; label: string }[] = [
  { key: "length", label: "8+ chars" },
  { key: "uppercase", label: "Uppercase" },
  { key: "lowercase", label: "Lowercase" },
  { key: "number", label: "Number" },
  { key: "special", label: "Special" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuth();
  const { isDark, toggle } = useTheme();
  const redirectTo =
    new URLSearchParams(location.search).get("redirect") || "/dashboard";

  useEffect(() => {
    if (session) navigate(redirectTo, { replace: true });
  }, [session, navigate, redirectTo]);

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const strength = useMemo(() => checkStrength(password), [password]);
  const strengthScore = Object.values(strength).filter(Boolean).length;
  const isStrong = strengthScore === 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "signup" && !isStrong) return;
    setLoading(true);
    setError("");
    setMessage("");

    if (tab === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      navigate(redirectTo);
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      setMessage("Check your email to confirm, then sign in.");
      setTab("signin");
      setPassword("");
    }
    setLoading(false);
  };

  const switchTab = (t: "signin" | "signup") => {
    setTab(t); setError(""); setMessage(""); setPassword(""); setShowPw(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: "var(--th-bg)" }}
    >
      {/* Ambient light orbs — warm neutral glows */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600, height: 600,
          top: "-15%", left: "-10%",
          background: isDark
            ? "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(168,162,158,0.08) 0%, transparent 65%)",
          animation: "float-1 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500, height: 500,
          bottom: "-10%", right: "-5%",
          background: isDark
            ? "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(214,211,209,0.10) 0%, transparent 65%)",
          animation: "float-2 15s ease-in-out infinite",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400, height: 400,
          top: "40%", right: "30%",
          background: isDark
            ? "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(180,175,170,0.06) 0%, transparent 65%)",
          animation: "float-3 18s ease-in-out infinite",
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Card */}
      <div
        className="w-full max-w-[440px] relative"
        style={{ animation: "enter 0.5s ease-out" }}
      >
        {/* Glow behind card */}
        <div
          className="absolute -inset-px rounded-[25px] pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03), rgba(255,255,255,0.06))"
              : "linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02), rgba(0,0,0,0.03))",
            filter: "blur(1px)",
          }}
        />

        <div
          className="relative rounded-[24px]"
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
          {/* Inner highlight — warm neutral glow */}
          <div
            className="absolute inset-0 rounded-[24px] pointer-events-none"
            style={{
              background: isDark
                ? "radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.04) 0%, transparent 50%)"
                : "radial-gradient(ellipse at 30% 0%, rgba(0,0,0,0.02) 0%, transparent 50%)",
            }}
          />

          {/* Header: Logo + theme toggle */}
          <div className="relative flex items-center justify-between mb-10">
            <div className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 512 512" fill="none">
                <defs>
                  <linearGradient id="lpt" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#818cf8"/>
                    <stop offset="100%" stopColor="#6366f1"/>
                  </linearGradient>
                  <linearGradient id="lpm" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#4f46e5"/>
                  </linearGradient>
                </defs>
                <path d="M96 340 L256 420 L416 340 L256 260Z" fill="#312e81" opacity="0.7"/>
                <path d="M96 280 L256 360 L416 280 L256 200Z" fill="url(#lpm)" opacity="0.75"/>
                <path d="M96 220 L256 300 L416 220 L256 140Z" fill="url(#lpt)"/>
                <path d="M96 220 L256 300 L256 140Z" fill="white" opacity="0.08"/>
              </svg>
              <span className="text-[14px] font-semibold tracking-[-0.01em]" style={{ color: "var(--th-text)" }}>debrieft</span>
            </div>

            <button
              onClick={toggle}
              className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200"
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
          </div>

          {/* Title */}
          <div className="relative">
            <h2
              className="text-[32px] font-semibold tracking-[-0.03em] mb-3"
              style={{ color: "var(--th-text)" }}
            >
              {tab === "signin" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-[14px] mb-10 leading-relaxed" style={{ color: "var(--th-text-muted)" }}>
              {tab === "signin"
                ? "Sign in to manage your studio."
                : "Start your free studio account."}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-10 p-1 rounded-xl" style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
          }}>
            {(["signin", "signup"] as const).map((id) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className="flex-1 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 rounded-lg"
                style={{
                  backgroundColor: tab === id
                    ? isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)"
                    : "transparent",
                  color: tab === id ? "var(--th-text)" : "var(--th-text-muted)",
                  boxShadow: tab === id
                    ? isDark
                      ? "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                      : "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
                    : "none",
                }}
              >
                {id === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          {message && <Alert variant="success" className="mb-6">{message}</Alert>}
          {error && <Alert variant="error" className="mb-6">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div>
                <label className="block text-[13px] font-medium" style={{ color: "var(--th-text-secondary)", marginBottom: "12px" }}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className="w-full h-12 rounded-xl px-4 text-[14px] outline-none transition-all duration-200"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    color: "var(--th-text)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = isDark ? "rgba(161,161,170,0.4)" : "rgba(82,82,91,0.3)";
                    e.target.style.boxShadow = isDark
                      ? "0 0 0 3px rgba(161,161,170,0.08)"
                      : "0 0 0 3px rgba(82,82,91,0.06)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium" style={{ color: "var(--th-text-secondary)", marginBottom: "12px" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    className="w-full h-12 rounded-xl px-4 pr-11 text-[14px] outline-none transition-all duration-200"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                      color: "var(--th-text)",
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === "signup" ? "Min. 8 characters" : "Enter password"}
                    autoComplete={tab === "signin" ? "current-password" : "new-password"}
                    onFocus={(e) => {
                      e.target.style.borderColor = isDark ? "rgba(161,161,170,0.4)" : "rgba(82,82,91,0.3)";
                      e.target.style.boxShadow = isDark
                        ? "0 0 0 3px rgba(161,161,170,0.08)"
                        : "0 0 0 3px rgba(82,82,91,0.06)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors bg-transparent"
                    style={{ color: "var(--th-text-muted)" }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {showPw ? (
                        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                      ) : (
                        <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {tab === "signup" && password.length > 0 && (
                <div style={{ animation: "enter 0.2s ease-out" }}>
                  <div className="flex gap-1.5 mb-2.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-[3px] rounded-full transition-all duration-300"
                        style={{
                          backgroundColor:
                            i <= strengthScore
                              ? strengthScore <= 2
                                ? "#FF453A"
                                : strengthScore <= 4
                                ? "#FF9F0A"
                                : "#32D74B"
                              : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {REQS.map((r) => (
                      <span
                        key={r.key}
                        className="text-[11px] transition-colors"
                        style={{ color: strength[r.key] ? "#32D74B" : "var(--th-text-muted)" }}
                      >
                        {strength[r.key] ? "\u2713" : "\u2022"} {r.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (tab === "signup" && !isStrong)}
              className="w-full rounded-xl text-[14px] font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{
                height: "48px",
                marginTop: "36px",
                background: isDark ? "#fafafa" : "#18181b",
                color: isDark ? "#18181b" : "#fafafa",
                boxShadow: isDark
                  ? "0 4px 16px -4px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "0 4px 16px -4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
                border: "none",
              }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  {tab === "signin" ? "Signing in..." : "Creating..."}
                </span>
              ) : tab === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="relative text-center text-[13px] mt-8" style={{ color: "var(--th-text-muted)" }}>
            {tab === "signin" ? "No account? " : "Have an account? "}
            <button
              onClick={() => switchTab(tab === "signin" ? "signup" : "signin")}
              className="font-semibold cursor-pointer underline-offset-2 bg-transparent transition-colors"
              style={{ color: "var(--th-text)" }}
            >
              {tab === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
