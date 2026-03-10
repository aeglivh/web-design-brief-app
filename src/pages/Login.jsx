import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, useAuth } from "../lib/supabase";

const acc = "#3b82f6";
const inp = { width:"100%", border:"1px solid #e2e8f0", borderRadius:4, padding:"12px 16px", fontFamily:"'Inter',sans-serif", fontSize:15, color:"#0f172a", background:"#f8fafc", outline:"none" };
const btn = { width:"100%", background:acc, color:"#fff", border:"none", borderRadius:4, padding:"13px", fontFamily:"'Inter',sans-serif", fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer", fontWeight:500 };
const lbl = { display:"block", fontSize:10, letterSpacing:"0.24em", textTransform:"uppercase", color:"#64748b", marginBottom:6, fontWeight:600 };

function checkStrength(pw) {
  return {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[^A-Za-z0-9]/.test(pw),
  };
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Login() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const session    = useAuth();
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  useEffect(() => {
    if (session) navigate(redirectTo, { replace: true });
  }, [session]);

  const [tab, setTab]           = useState("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [message, setMessage]   = useState("");

  const strength = useMemo(() => checkStrength(password), [password]);
  const strengthScore = Object.values(strength).filter(Boolean).length;
  const isStrong = strengthScore === 5;
  const strengthColor = strengthScore <= 1 ? "#ef4444" : strengthScore <= 3 ? "#f59e0b" : "#22c55e";
  const strengthLabel = strengthScore <= 1 ? "Weak" : strengthScore <= 3 ? "Fair" : strengthScore === 4 ? "Good" : "Strong";

  const handleSubmit = async e => {
    e.preventDefault();
    if (tab === "signup" && !isStrong) return;
    setLoading(true); setError(""); setMessage("");

    if (tab === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      navigate(redirectTo);
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      setMessage("Check your email to confirm your account, then sign in.");
      setTab("signin");
      setPassword("");
    }
    setLoading(false);
  };

  const REQS = [
    { key:"length",    label:"At least 8 characters" },
    { key:"uppercase", label:"One uppercase letter (A–Z)" },
    { key:"lowercase", label:"One lowercase letter (a–z)" },
    { key:"number",    label:"One number (0–9)" },
    { key:"special",   label:"One special character (!@#$…)" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#f1f5f9;font-family:'Inter',sans-serif}
        input:focus{border-color:${acc}!important;background:#fff!important;outline:none}
        .pw-wrap:focus-within{border-color:${acc}!important;background:#fff!important}
      `}</style>
      <div style={{ minHeight:"100vh", background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
        <div style={{ background:"#fff", borderRadius:8, width:"100%", maxWidth:420, padding:"52px 48px", boxShadow:"0 1px 3px rgba(0,0,0,.04),0 8px 40px rgba(0,0,0,.07)" }}>

          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ width:40, height:40, borderRadius:6, background:acc, display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:18, marginBottom:14 }}>W</div>
            <div style={{ fontSize:24, fontWeight:600, color:"#0f172a" }}>Designer Portal</div>
          </div>

          <div style={{ display:"flex", border:"1px solid #e2e8f0", borderRadius:4, marginBottom:28, overflow:"hidden" }}>
            {[["signin","Sign In"],["signup","Create Account"]].map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setError(""); setMessage(""); setPassword(""); setShowPw(false); }}
                style={{ flex:1, background:tab===id?acc:"#f8fafc", color:tab===id?"#fff":"#64748b", border:"none", padding:"10px", fontFamily:"'Inter',sans-serif", fontSize:12, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
                {label}
              </button>
            ))}
          </div>

          {message && (
            <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:4, padding:"12px 14px", marginBottom:16, fontSize:13, color:"#16a34a", lineHeight:1.5 }}>
              {message}
            </div>
          )}
          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:4, padding:"12px 14px", marginBottom:16, fontSize:13, color:"#dc2626", lineHeight:1.5 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Email</label>
              <input type="email" required style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@studio.com"/>
            </div>

            <div style={{ marginBottom: tab === "signup" && password ? 10 : 24 }}>
              <label style={lbl}>Password</label>
              <div className="pw-wrap" style={{ display:"flex", alignItems:"center", border:"1px solid #e2e8f0", borderRadius:4, background:"#f8fafc", overflow:"hidden" }}>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  style={{ ...inp, flex:1, border:"none", background:"transparent", marginBottom:0 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={tab === "signup" ? "Create a strong password" : "Your password"}
                  autoComplete={tab === "signin" ? "current-password" : "new-password"}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ background:"none", border:"none", padding:"0 14px", cursor:"pointer", color:"#94a3b8", display:"flex", alignItems:"center", flexShrink:0 }}
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  <EyeIcon open={showPw}/>
                </button>
              </div>
            </div>

            {tab === "signup" && password.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", gap:3, marginBottom:8 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= strengthScore ? strengthColor : "#e2e8f0", transition:"background .2s" }}/>
                  ))}
                </div>
                <div style={{ fontSize:11, color:strengthColor, fontWeight:600, marginBottom:8, letterSpacing:"0.08em" }}>
                  {strengthLabel}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {REQS.map(r => (
                    <div key={r.key} style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color: strength[r.key] ? "#22c55e" : "#94a3b8" }}>
                      <span style={{ fontSize:12, lineHeight:1 }}>{strength[r.key] ? "✓" : "○"}</span>
                      {r.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit"
              style={{ ...btn, opacity: (loading || (tab === "signup" && !isStrong)) ? 0.45 : 1, cursor: (tab === "signup" && !isStrong) ? "not-allowed" : "pointer" }}
              disabled={loading || (tab === "signup" && !isStrong)}>
              {loading ? "Please wait…" : tab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
