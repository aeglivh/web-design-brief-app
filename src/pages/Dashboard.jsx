import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, useAuth } from "../lib/supabase";
import { PrintView, BriefSummaryCard } from "../components/BriefView";
import { QuoteTable, QuoteModal } from "../components/QuoteView";

const API_BASE = (typeof window !== "undefined" && window.__BRIEF_API__) || "";
const ACCENTS     = ["#3b82f6","#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#0f172a","#64748b"];
const BG_PRESETS  = ["#f1f5f9","#f8fafc","#f0f0f0","#ffffff","#0f172a","#1e293b","#faf5ff","#f0fdf4"];
const HEADING_FONTS = ["Inter","Cormorant Garamond","Playfair Display","EB Garamond","Lora","Libre Baskerville"];
const BODY_FONTS    = ["Inter","DM Sans","Jost","Karla"];

const DEFAULT_PAGE_RATES = { landing: 1500, inner: 800, blog: 600, ecommerce: 2000 };
const DEFAULT_ADDON_RATES = { contactForm: 200, gallery: 400, newsletter: 300, seo: 500, booking: 600, ecommerce: 1500, livechat: 200, multilanguage: 800, blog: 400, copywriting: 150, photography: 400, maintenance: 200, training: 300 };
const DEFAULT_MULTIPLIERS = { simple: 1.0, moderate: 1.2, complex: 1.5 };

function isLight(hex) {
  const h = (hex || "#ffffff").replace("#","");
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return (r*299 + g*587 + b*114) / 1000 > 128;
}

async function authFetch(url, opts = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || "";
  return fetch(url, {
    ...opts,
    headers: { "Content-Type":"application/json", "Authorization":`Bearer ${token}`, ...(opts.headers||{}) },
  });
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

function OnboardingModal({ onDone }) {
  const [studioName, setStudioName] = useState("");
  const [slug, setSlug]             = useState("");
  const [error, setError]           = useState("");
  const [saving, setSaving]         = useState(false);

  const autoSlug = name => name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);

  const handleNameChange = e => { setStudioName(e.target.value); setSlug(autoSlug(e.target.value)); };

  const submit = async e => {
    e.preventDefault();
    setSaving(true); setError("");
    const res = await authFetch(`${API_BASE}/api/designer`, { method:"POST", body:JSON.stringify({ studio_name:studioName, slug }) });
    const d = await res.json();
    if (!res.ok) { setError(d.error || "Error"); setSaving(false); return; }
    onDone(d);
  };

  const acc = "#3b82f6";
  const inp = { width:"100%", border:"1px solid #e2e8f0", borderRadius:4, padding:"11px 14px", fontSize:14, color:"#0f172a", background:"#f8fafc", outline:"none" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:8, width:"100%", maxWidth:440, padding:"48px 44px", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize:24, fontWeight:600, color:"#0f172a", marginBottom:6 }}>Welcome!</div>
        <p style={{ fontSize:13, color:"#64748b", lineHeight:1.65, marginBottom:28 }}>
          Set up your studio. Clients will visit<br/>
          <strong style={{ color:"#0f172a" }}>yoursite.com/studio/[your-slug]</strong>
        </p>
        {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:4, padding:"10px 12px", marginBottom:14, fontSize:13, color:"#dc2626" }}>{error}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:10, letterSpacing:"0.24em", textTransform:"uppercase", color:"#64748b", marginBottom:6, fontWeight:600 }}>Studio Name</label>
            <input type="text" required style={inp} value={studioName} onChange={handleNameChange} placeholder="Pixel Studio"/>
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:"block", fontSize:10, letterSpacing:"0.24em", textTransform:"uppercase", color:"#64748b", marginBottom:6, fontWeight:600 }}>Your Slug</label>
            <input type="text" required pattern="[a-z0-9-]{2,60}" style={inp} value={slug} onChange={e => setSlug(e.target.value)} placeholder="pixel-studio"/>
            <p style={{ fontSize:11, color:"#94a3b8", marginTop:5 }}>Letters, numbers, hyphens — 2 to 60 characters</p>
          </div>
          <button type="submit" style={{ width:"100%", background:acc, color:"#fff", border:"none", borderRadius:4, padding:"12px", fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer", opacity:saving?0.6:1 }} disabled={saving}>
            {saving ? "Creating…" : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Brief Modal ─────────────────────────────────────────────────────────────

function BriefModal({ brief: b, brand: designerBrand, onClose, onQuoteGenerated }) {
  const [summaryData, setSummaryData] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    if (!b.brief_text) return;
    fetch(`${API_BASE}/api/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefText: b.brief_text }),
    })
      .then(r => r.json())
      .then(d => { if (d?.summaryData) setSummaryData(d.summaryData); })
      .catch(() => {});
  }, [b.brief_text]);

  const generateQuote = async () => {
    setQuoteLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/quote`, {
        method: "POST",
        body: JSON.stringify({ briefId: b.id }),
      });
      const data = await res.json();
      if (data.quote) {
        onQuoteGenerated(b.id, data.quote);
        setShowQuote(true);
      }
    } catch {}
    setQuoteLoading(false);
  };

  const acc = designerBrand?.accent || "#3b82f6";
  const brand = { studioName: designerBrand?.studioName || "Web Design Brief", accent: acc, logoUrl: designerBrand?.logoUrl || "" };

  const form = {
    contactName: b.client_name,
    businessName: b.business_name,
    budget: b.budget,
    projectType: b.project_type,
    pageCount: b.page_count,
  };

  if (showQuote && b.quote) {
    return <QuoteModal quote={b.quote} businessName={b.business_name} accent={acc} onClose={() => setShowQuote(false)} />;
  }

  return (
    <PrintView
      brief={b.brief_text}
      form={form}
      brand={brand}
      tags={b.tags}
      summaryData={summaryData}
      onClose={onClose}
      extraActions={
        <div style={{ display:"flex", gap:8 }}>
          {b.quote ? (
            <button onClick={() => setShowQuote(true)}
              style={{ background:"#10b981", color:"#fff", border:"none", borderRadius:4, padding:"8px 18px", fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer" }}>
              View Quote
            </button>
          ) : (
            <button onClick={generateQuote} disabled={quoteLoading}
              style={{ background:"#10b981", color:"#fff", border:"none", borderRadius:4, padding:"8px 18px", fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", opacity:quoteLoading?0.5:1 }}>
              {quoteLoading ? "Generating…" : "Generate Quote"}
            </button>
          )}
        </div>
      }
    />
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const session  = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const urlBriefId = new URLSearchParams(location.search).get('brief');

  const [designer, setDesigner]       = useState(null);
  const [briefs, setBriefs]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showOnboarding, setOnboarding] = useState(false);
  const [selectedBrief, selectBrief]  = useState(null);
  const [saved, setSaved]             = useState(false);
  const [saveErr, setSaveErr]         = useState("");
  const [copied, setCopied]           = useState(false);
  const [activeTab, setActiveTab]     = useState("briefs");

  // Branding state
  const [bStudio, setBStudio]         = useState("");
  const [bTagline, setBTagline]       = useState("");
  const [bSlug, setBSlug]             = useState("");
  const [bAccent, setBAccent]         = useState("#3b82f6");
  const [bEmail, setBEmail]           = useState("");
  const [bLogoUrl, setBLogoUrl]       = useState("");
  const [bBgColor, setBBgColor]       = useState("#f1f5f9");
  const [bFormBgColor, setBFormBgColor] = useState("#ffffff");
  const [bDashBgColor, setBDashBgColor] = useState("#f1f5f9");
  const [bDashBarColor, setBDashBarColor] = useState("#0f172a");
  const [bHeadingFont, setBHeadingFont] = useState("Inter");
  const [bBodyFont, setBBodyFont]     = useState("Inter");

  // Rates state
  const [rates, setRates]             = useState(null);
  const [rPageRates, setRPageRates]   = useState(DEFAULT_PAGE_RATES);
  const [rAddonRates, setRAddonRates] = useState(DEFAULT_ADDON_RATES);
  const [rHourly, setRHourly]         = useState(120);
  const [rMultipliers, setRMultipliers] = useState(DEFAULT_MULTIPLIERS);
  const [rCurrency, setRCurrency]     = useState("CHF");
  const [ratesSaved, setRatesSaved]   = useState(false);
  const [ratesErr, setRatesErr]       = useState("");

  useEffect(() => {
    if (session === null) navigate("/login");
  }, [session, navigate]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      try {
        const [dRes, bRes, rRes] = await Promise.all([
          authFetch(`${API_BASE}/api/designer`),
          authFetch(`${API_BASE}/api/briefs`),
          authFetch(`${API_BASE}/api/rates`),
        ]);
        const dData = await dRes.json();
        const bData = await bRes.json();
        const rData = await rRes.json();

        if (dData && dData.id) {
          setDesigner(dData);
          setBStudio(dData.studio_name || "");
          setBTagline(dData.tagline || "");
          setBSlug(dData.slug || "");
          setBAccent(dData.accent_color || "#3b82f6");
          setBEmail(dData.designer_email || "");
          setBLogoUrl(dData.logo_url || "");
          setBBgColor(dData.bg_color || "#f1f5f9");
          setBFormBgColor(dData.form_bg_colour || "#ffffff");
          setBDashBgColor(dData.dashboard_bg_colour || "#f1f5f9");
          setBDashBarColor(dData.dashboard_bar_colour || "#0f172a");
          setBHeadingFont(dData.heading_font || "Inter");
          setBBodyFont(dData.body_font || "Inter");
        } else {
          setOnboarding(true);
        }
        if (Array.isArray(bData)) setBriefs(bData);
        if (rData && rData.designer_id) {
          setRates(rData);
          setRPageRates(rData.page_rates || DEFAULT_PAGE_RATES);
          setRAddonRates(rData.addon_rates || DEFAULT_ADDON_RATES);
          setRHourly(rData.hourly_rate ?? 120);
          setRMultipliers(rData.multipliers || DEFAULT_MULTIPLIERS);
          setRCurrency(rData.currency || "CHF");
        }
      } catch {}
      setLoading(false);
    })();
  }, [session]);

  useEffect(() => {
    if (urlBriefId && briefs.length > 0 && !selectedBrief) {
      const match = briefs.find(b => b.id === urlBriefId);
      if (match) selectBrief(match);
    }
  }, [briefs, urlBriefId]);

  const saveBranding = async e => {
    e.preventDefault();
    setSaved(false); setSaveErr("");
    const res = await authFetch(`${API_BASE}/api/designer`, {
      method:"PUT",
      body:JSON.stringify({ studio_name:bStudio, tagline:bTagline, slug:bSlug, accent_color:bAccent, designer_email:bEmail, logo_url:bLogoUrl, bg_color:bBgColor, form_bg_colour:bFormBgColor, dashboard_bg_colour:bDashBgColor, dashboard_bar_colour:bDashBarColor, heading_font:bHeadingFont, body_font:bBodyFont }),
    });
    const d = await res.json();
    if (!res.ok) { setSaveErr(d.error || "Save failed"); return; }
    setDesigner(d);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveRates = async e => {
    e.preventDefault();
    setRatesSaved(false); setRatesErr("");
    const res = await authFetch(`${API_BASE}/api/rates`, {
      method:"PUT",
      body:JSON.stringify({ page_rates:rPageRates, addon_rates:rAddonRates, hourly_rate:rHourly, multipliers:rMultipliers, currency:rCurrency }),
    });
    const d = await res.json();
    if (!res.ok) { setRatesErr(d.error || "Save failed"); return; }
    setRates(d);
    setRatesSaved(true);
    setTimeout(() => setRatesSaved(false), 3000);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/studio/${designer?.slug}`;
    try { navigator.clipboard.writeText(url); } catch {
      const el = document.createElement("textarea");
      el.value = url; document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLogoUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setBLogoUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const deleteBrief = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this brief?")) return;
    const res = await authFetch(`${API_BASE}/api/briefs?id=${encodeURIComponent(id)}`, { method:"DELETE" });
    if (res.ok) setBriefs(prev => prev.filter(b => b.id !== id));
  };

  const handleQuoteGenerated = (briefId, quote) => {
    setBriefs(prev => prev.map(b => b.id === briefId ? { ...b, quote } : b));
    if (selectedBrief?.id === briefId) selectBrief(prev => ({ ...prev, quote }));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (session === undefined || loading) {
    return (
      <div style={{ minHeight:"100vh", background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:26, height:26, border:"2px solid #e2e8f0", borderTopColor:"#3b82f6", borderRadius:"50%", animation:"spin .75s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const acc = bAccent || "#3b82f6";
  const barTextColor = isLight(bDashBarColor) ? "#0f172a" : "#f8fafc";
  const barMuted     = isLight(bDashBarColor) ? "rgba(0,0,0,0.55)" : "#94a3b8";
  const barBorder    = isLight(bDashBarColor) ? "rgba(0,0,0,0.2)" : "#475569";
  const dashTextColor = isLight(bDashBgColor) ? "#0f172a" : "#f8fafc";
  const dashMuted     = isLight(bDashBgColor) ? "#64748b" : "rgba(248,250,252,0.55)";
  const dashSubtle    = isLight(bDashBgColor) ? "#94a3b8" : "rgba(248,250,252,0.35)";
  const cardBg        = isLight(bDashBgColor) ? "#fff"    : "rgba(255,255,255,0.06)";
  const cardBorder    = isLight(bDashBgColor) ? "#e2e8f0" : "rgba(255,255,255,0.12)";

  const inp  = { width:"100%", border:"1px solid #e2e8f0", borderRadius:4, padding:"10px 13px", fontSize:14, color:"#0f172a", background:"#f8fafc", outline:"none" };
  const lbl  = { display:"block", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:acc, marginBottom:5, fontWeight:600 };
  const btnStyle  = { background:"#0f172a", color:"#f8fafc", border:"none", borderRadius:4, padding:"9px 20px", fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer" };
  const btnAcc  = { ...btnStyle, background:acc };
  const btnGhost = { ...btnStyle, background:"transparent", color:barMuted, border:`1px solid ${barBorder}` };

  // ─── Number input helper for rates ────────────────────────────────────────
  const RateInput = ({ label, value, onChange }) => (
    <div style={{ marginBottom:10 }}>
      <label style={{ ...lbl, fontSize:9 }}>{label}</label>
      <input type="number" min="0" step="50" style={{ ...inp, padding:"8px 10px", fontSize:13 }}
        value={value} onChange={e => onChange(Number(e.target.value) || 0)}/>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:bDashBgColor }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Cormorant+Garamond:wght@400;700&family=Playfair+Display:wght@400;700&family=EB+Garamond:wght@400;700&family=Lora:wght@400;700&family=Libre+Baskerville:wght@400;700&family=DM+Sans:wght@400;500&family=Jost:wght@400;500&family=Karla:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${bDashBgColor};font-family:'${bBodyFont}',sans-serif}
        input:focus,textarea:focus,select:focus{border-color:${acc}!important;background:#fff!important;outline:none}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {showOnboarding && <OnboardingModal onDone={d => { setDesigner(d); setBStudio(d.studio_name); setBSlug(d.slug); setOnboarding(false); }}/>}
      {selectedBrief && <BriefModal brief={selectedBrief} brand={{ studioName:bStudio, accent:bAccent, logoUrl:bLogoUrl }} onClose={() => selectBrief(null)} onQuoteGenerated={handleQuoteGenerated}/>}

      {/* Top bar */}
      <div style={{ background:bDashBarColor, padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:4, background:acc, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:16 }}>
            {bStudio.charAt(0) || "W"}
          </div>
          <span style={{ fontSize:17, fontWeight:600, color:barTextColor, letterSpacing:"0.02em" }}>{bStudio || "Dashboard"}</span>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {designer?.slug && (
            <>
              <button onClick={copyLink} style={{ ...btnAcc, fontSize:11 }}>{copied ? "Copied!" : "Copy Client Link"}</button>
              <a href={`/studio/${designer.slug}`} target="_blank" rel="noreferrer"
                style={{ ...btnGhost, textDecoration:"none" }}>Preview Form</a>
            </>
          )}
          <button onClick={signOut} style={btnGhost}>Sign Out</button>
        </div>
      </div>

      <div style={{ display:"flex", minHeight:"calc(100vh - 58px)" }}>

        {/* Left panel */}
        <div style={{ width:300, flexShrink:0, background:"#fff", borderRight:"1px solid #e2e8f0", overflowY:"auto" }}>

          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:"1px solid #e2e8f0" }}>
            {[["briefs","Briefs"],["settings","Settings"],["rates","Rates"]].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ flex:1, padding:"12px 8px", fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", border:"none",
                  background:activeTab===id?"#fff":"#f8fafc",
                  color:activeTab===id?acc:"#94a3b8",
                  fontWeight:activeTab===id?600:400,
                  borderBottom:activeTab===id?`2px solid ${acc}`:"2px solid transparent",
                }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding:"24px 22px" }}>

            {/* ── Settings tab ───────────────────────────────────────────── */}
            {activeTab === "settings" && (
              <form onSubmit={saveBranding}>
                <div style={{ fontSize:18, fontWeight:600, color:"#0f172a", marginBottom:4 }}>Studio Branding</div>
                <p style={{ fontSize:12, color:"#64748b", marginBottom:20, lineHeight:1.6 }}>These settings appear on the client form.</p>

                {[
                  { label:"Studio Name", value:bStudio, set:setBStudio, ph:"Pixel Studio" },
                  { label:"Tagline", value:bTagline, set:setBTagline, ph:"Websites with purpose." },
                  { label:"Slug", value:bSlug, set:setBSlug, ph:"pixel-studio", hint:"yoursite.com/studio/[slug]" },
                  { label:"Designer Email", value:bEmail, set:setBEmail, ph:"hello@studio.com", type:"email" },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom:12 }}>
                    <label style={lbl}>{f.label}</label>
                    <input type={f.type||"text"} style={inp} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph}/>
                    {f.hint && <p style={{ fontSize:10, color:"#94a3b8", marginTop:3 }}>{f.hint}</p>}
                  </div>
                ))}

                <div style={{ marginBottom:12 }}>
                  <label style={lbl}>Studio Logo</label>
                  {bLogoUrl && (
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                      <img src={bLogoUrl} alt="Logo" style={{ width:44, height:44, objectFit:"contain", border:"1px solid #e2e8f0", borderRadius:4, background:"#f8fafc", padding:2 }}/>
                      <button type="button" onClick={() => setBLogoUrl("")} style={{ fontSize:11, background:"none", border:"1px solid #e2e8f0", borderRadius:4, padding:"4px 10px", color:"#64748b", cursor:"pointer" }}>Remove</button>
                    </div>
                  )}
                  <label style={{ display:"flex", alignItems:"center", gap:8, border:"1px dashed #e2e8f0", borderRadius:4, padding:"9px 12px", cursor:"pointer", background:"#f8fafc" }}>
                    <span style={{ fontSize:12, color:"#94a3b8" }}>{bLogoUrl ? "Change logo…" : "Upload SVG or PNG…"}</span>
                    <input type="file" accept=".svg,.png,image/svg+xml,image/png" style={{ display:"none" }} onChange={handleLogoUpload}/>
                  </label>
                </div>

                <div style={{ marginBottom:14 }}>
                  <label style={lbl}>Accent Colour</label>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                    <input type="color" value={acc} onChange={e => setBAccent(e.target.value)} style={{ width:36, height:32, border:"1px solid #e2e8f0", borderRadius:4, padding:2, cursor:"pointer" }}/>
                    <input type="text" style={{ ...inp, flex:1 }} value={acc} onChange={e => setBAccent(e.target.value)}/>
                  </div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {ACCENTS.map(c => (
                      <div key={c} onClick={() => setBAccent(c)} style={{ width:20, height:20, borderRadius:3, background:c, cursor:"pointer", outline:acc===c?`2px solid ${c}`:"none", outlineOffset:2 }}/>
                    ))}
                  </div>
                </div>

                {[
                  { label:"Background", value:bBgColor, set:setBBgColor },
                  { label:"Form Background", value:bFormBgColor, set:setBFormBgColor },
                  { label:"Dashboard Background", value:bDashBgColor, set:setBDashBgColor },
                  { label:"Dashboard Bar", value:bDashBarColor, set:setBDashBarColor },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom:12 }}>
                    <label style={lbl}>{f.label}</label>
                    <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:6 }}>
                      <input type="color" value={f.value} onChange={e => f.set(e.target.value)} style={{ width:32, height:28, border:"1px solid #e2e8f0", borderRadius:3, padding:2, cursor:"pointer" }}/>
                      <input type="text" style={{ ...inp, flex:1, padding:"6px 10px", fontSize:12 }} value={f.value} onChange={e => f.set(e.target.value)}/>
                    </div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {BG_PRESETS.map(c => (
                        <div key={c} onClick={() => f.set(c)} style={{ width:18, height:18, borderRadius:3, background:c, cursor:"pointer", border:"1px solid #e2e8f0", outline:f.value===c?`2px solid ${acc}`:"none", outlineOffset:2 }}/>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ marginBottom:12 }}>
                  <label style={lbl}>Heading Font</label>
                  <select value={bHeadingFont} onChange={e => setBHeadingFont(e.target.value)} style={{ ...inp, fontFamily:`'${bHeadingFont}',serif` }}>
                    {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom:14 }}>
                  <label style={lbl}>Body Font</label>
                  <select value={bBodyFont} onChange={e => setBBodyFont(e.target.value)} style={{ ...inp, fontFamily:`'${bBodyFont}',sans-serif` }}>
                    {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {saveErr && <p style={{ fontSize:12, color:"#dc2626", marginBottom:10 }}>{saveErr}</p>}
                <button type="submit" style={{ ...btnAcc, width:"100%", padding:"11px" }}>
                  {saved ? "Saved!" : "Save Branding"}
                </button>
              </form>
            )}

            {/* ── Rates tab ──────────────────────────────────────────────── */}
            {activeTab === "rates" && (
              <form onSubmit={saveRates}>
                <div style={{ fontSize:18, fontWeight:600, color:"#0f172a", marginBottom:4 }}>Rate Configuration</div>
                <p style={{ fontSize:12, color:"#64748b", marginBottom:20, lineHeight:1.6 }}>Set your rates for AI-generated quotes.</p>

                <div style={{ marginBottom:12 }}>
                  <label style={lbl}>Currency</label>
                  <select style={{ ...inp, maxWidth:100 }} value={rCurrency} onChange={e => setRCurrency(e.target.value)}>
                    {["CHF","EUR","USD","GBP"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginBottom:8, marginTop:16 }}>Page Rates</div>
                <RateInput label="Landing Page" value={rPageRates.landing} onChange={v => setRPageRates(p => ({...p, landing:v}))}/>
                <RateInput label="Inner Page" value={rPageRates.inner} onChange={v => setRPageRates(p => ({...p, inner:v}))}/>
                <RateInput label="Blog Page" value={rPageRates.blog} onChange={v => setRPageRates(p => ({...p, blog:v}))}/>
                <RateInput label="E-commerce Page" value={rPageRates.ecommerce} onChange={v => setRPageRates(p => ({...p, ecommerce:v}))}/>

                <div style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginBottom:8, marginTop:16 }}>Add-on Rates</div>
                {Object.entries(rAddonRates).map(([key, val]) => (
                  <RateInput key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    value={val} onChange={v => setRAddonRates(p => ({...p, [key]:v}))}/>
                ))}

                <div style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginBottom:8, marginTop:16 }}>Hourly Rate</div>
                <RateInput label={`${rCurrency} / hour`} value={rHourly} onChange={setRHourly}/>

                <div style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginBottom:8, marginTop:16 }}>Complexity Multipliers</div>
                <RateInput label="Simple" value={rMultipliers.simple} onChange={v => setRMultipliers(p => ({...p, simple:v}))}/>
                <RateInput label="Moderate" value={rMultipliers.moderate} onChange={v => setRMultipliers(p => ({...p, moderate:v}))}/>
                <RateInput label="Complex" value={rMultipliers.complex} onChange={v => setRMultipliers(p => ({...p, complex:v}))}/>

                {ratesErr && <p style={{ fontSize:12, color:"#dc2626", marginBottom:10 }}>{ratesErr}</p>}
                <button type="submit" style={{ ...btnAcc, width:"100%", padding:"11px", marginTop:8 }}>
                  {ratesSaved ? "Saved!" : "Save Rates"}
                </button>
              </form>
            )}

            {/* ── Briefs tab (summary) ───────────────────────────────────── */}
            {activeTab === "briefs" && (
              <div>
                <div style={{ fontSize:18, fontWeight:600, color:"#0f172a", marginBottom:4 }}>Client Briefs</div>
                <p style={{ fontSize:12, color:"#64748b", marginBottom:16, lineHeight:1.6 }}>
                  {briefs.length} brief{briefs.length !== 1 ? "s" : ""} generated
                </p>
                {designer?.slug && (
                  <div style={{ background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:4, padding:"12px 14px" }}>
                    <p style={{ fontSize:11, color:"#334155", lineHeight:1.7 }}>
                      Share this link with clients:<br/>
                      <strong style={{ wordBreak:"break-all" }}>{window.location.origin}/studio/{designer.slug}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main — briefs list */}
        <div style={{ flex:1, padding:"32px 36px", overflowY:"auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
            <div>
              <div style={{ fontSize:24, fontWeight:600, color:dashTextColor, marginBottom:2 }}>Client Briefs</div>
              <p style={{ fontSize:13, color:dashMuted }}>{briefs.length} brief{briefs.length !== 1 ? "s" : ""} generated</p>
            </div>
          </div>

          {briefs.length === 0 ? (
            <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:6, padding:"48px 32px", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
              <div style={{ fontSize:20, fontWeight:600, color:dashTextColor, marginBottom:8 }}>No briefs yet</div>
              <p style={{ fontSize:13, color:dashMuted, lineHeight:1.65, maxWidth:320, margin:"0 auto 20px" }}>
                Share your client form link and briefs will appear here once submitted.
              </p>
              {designer?.slug && (
                <button onClick={copyLink} style={btnAcc}>{copied ? "Copied!" : "Copy Client Link"}</button>
              )}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {briefs.map(b => (
                <div key={b.id} onClick={() => selectBrief(b)}
                  style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:6, padding:"18px 22px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, transition:"box-shadow .15s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,.08)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow="none"}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:17, fontWeight:600, color:dashTextColor, marginBottom:3 }}>
                      {b.business_name || b.client_name || "Unnamed"}
                    </div>
                    <div style={{ fontSize:12, color:dashMuted, display:"flex", gap:12, flexWrap:"wrap" }}>
                      {b.industry && <span>{b.industry}</span>}
                      {b.project_type && <span>· {b.project_type === "redesign" ? "Redesign" : "New site"}</span>}
                      {b.page_count && <span>· ~{b.page_count} pages</span>}
                      {b.budget && <span>· {b.budget}</span>}
                    </div>
                    {b.client_email && <div style={{ fontSize:11, color:dashSubtle, marginTop:3 }}>{b.client_email}</div>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                    {b.quote && <span style={{ fontSize:10, background:"#dcfce7", color:"#16a34a", borderRadius:3, padding:"3px 8px", fontWeight:500 }}>Quoted</span>}
                    <span style={{ fontSize:11, color:dashSubtle }}>
                      {new Date(b.created_at).toLocaleDateString("en-GB",{ day:"numeric", month:"short", year:"numeric" })}
                    </span>
                    <span style={{ fontSize:11, color:acc, border:`1px solid ${acc}33`, borderRadius:4, padding:"4px 10px", fontWeight:500 }}>View</span>
                    <button onClick={e => deleteBrief(b.id, e)}
                      style={{ fontSize:11, background:"none", border:"1px solid #fecaca", borderRadius:4, padding:"4px 10px", color:"#dc2626", cursor:"pointer" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
