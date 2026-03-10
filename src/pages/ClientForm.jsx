import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BriefDisplay } from "../components/BriefView";

const API_BASE = (typeof window !== "undefined" && window.__BRIEF_API__) || "";

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  "Restaurant / Hospitality", "E-commerce / Retail", "Professional Services",
  "Healthcare / Wellness", "Real Estate", "Technology / SaaS", "Creative / Agency",
  "Education", "Non-profit", "Construction / Trades", "Finance / Insurance",
  "Beauty / Fashion", "Fitness / Sports", "Other",
];

const PRIMARY_GOALS = [
  "Generate leads", "Sell products online", "Build brand awareness",
  "Provide information", "Booking / reservations", "Portfolio showcase",
  "Community building", "Customer support",
];

const FEATURES = [
  "Contact form", "Newsletter signup", "Blog", "E-commerce / shop",
  "Booking system", "Gallery / portfolio", "Client portal / members area",
  "Live chat", "Social media feed", "Video backgrounds",
  "Animations / transitions", "Multi-language", "Search functionality",
  "Testimonials / reviews", "FAQ section", "Maps / location",
];

const CMS_OPTIONS = [
  "WordPress", "Webflow", "Shopify", "Squarespace", "Wix",
  "Custom / headless CMS", "No preference", "Other",
];

const CONTENT_CATEGORIES = [
  "Homepage copy", "About page", "Service / product descriptions",
  "Blog posts", "Testimonials", "Team bios", "FAQ", "Legal pages",
];

const VISUAL_STYLES = [
  { id: "minimal",    label: "Minimal & Clean" },
  { id: "bold",       label: "Bold & Dynamic" },
  { id: "elegant",    label: "Elegant & Refined" },
  { id: "playful",    label: "Playful & Creative" },
  { id: "corporate",  label: "Corporate & Professional" },
  { id: "editorial",  label: "Editorial & Story-driven" },
  { id: "brutalist",  label: "Brutalist / Experimental" },
  { id: "organic",    label: "Organic & Natural" },
];

const TONE_OPTIONS = [
  "Professional & authoritative", "Friendly & approachable",
  "Luxury & aspirational", "Casual & conversational",
  "Technical & precise", "Warm & personal",
];

const BUDGET_RANGES = [
  { id: "u3k",    label: "Under 3,000" },
  { id: "3to8",   label: "3,000 – 8,000" },
  { id: "8to15",  label: "8,000 – 15,000" },
  { id: "15to30", label: "15,000 – 30,000" },
  { id: "30plus", label: "30,000+" },
];

const CURRENCIES = ["CHF", "EUR", "USD", "GBP"];

const REFERRAL_SOURCES = [
  "Google search", "Social media", "Referral / word of mouth",
  "Directory / listing", "Existing client", "Other",
];

const STEP_LABELS = [
  "Business & Goals",
  "Project Scope",
  "Content & SEO",
  "Design & Brand",
  "Budget & Timeline",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyForm() {
  return {
    businessName: "", industry: "", contactName: "", contactEmail: "", contactPhone: "",
    currentUrl: "", primaryGoal: "", targetAudience: "",
    competitors: [{ url: "", notes: "" }, { url: "", notes: "" }, { url: "", notes: "" }],
    projectType: "new", painPoints: "", pageCount: "", features: [], integrations: "", cmsPreference: "",
    contentReadiness: {}, copywritingNeeds: "", photographyNeeds: "",
    currentSeo: "", seoGoals: "", googleBusiness: "", analytics: "", domainStatus: "",
    visualStyles: [], referenceSites: [{ url: "", notes: "" }, { url: "", notes: "" }, { url: "", notes: "" }],
    brandAssets: "", toneOfVoice: [], uploads: [],
    budgetRange: "", budgetCurrency: "CHF", launchDate: "", maintenanceInterest: "", decisionMakers: "", referralSource: "",
  };
}

function readImg(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      const mediaType = result.match(/data:(.*?);/)?.[1] || "application/octet-stream";
      resolve({ base64, mediaType });
    };
    reader.readAsDataURL(file);
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ClientForm() {
  const { slug } = useParams();
  const [brand, setBrand]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [brief, setBrief]       = useState(null);
  const [tags, setTags]         = useState(null);
  const [error, setError]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const topRef = useRef(null);

  // Load designer branding
  useEffect(() => {
    if (!slug) return;
    fetch(`${API_BASE}/api/designer?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { if (d && d.studio_name) setBrand(d); })
      .catch(() => {});
  }, [slug]);

  const acc       = brand?.accent_color || "#3b82f6";
  const bgColor   = brand?.bg_color || "#f1f5f9";
  const formBg    = brand?.form_bg_colour || "#ffffff";
  const headFont  = brand?.heading_font || "Inter";
  const bodyFont  = brand?.body_font || "Inter";

  const inp  = { width:"100%", border:"1px solid #e2e8f0", borderRadius:4, padding:"11px 14px", fontFamily:`'${bodyFont}',sans-serif`, fontSize:14, color:"#0f172a", background:"#f8fafc", outline:"none" };
  const lbl  = { display:"block", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#64748b", marginBottom:5, fontWeight:600, fontFamily:`'${bodyFont}',sans-serif` };
  const btnP = { background:acc, color:"#fff", border:"none", borderRadius:4, padding:"12px 28px", fontFamily:`'${bodyFont}',sans-serif`, fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer", fontWeight:500 };
  const btnG = { ...btnP, background:"transparent", color:"#64748b", border:"1px solid #e2e8f0" };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const toggleArr = (key, val) => setForm(prev => {
    const arr = prev[key] || [];
    return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
  });
  const setNested = (key, idx, field, val) => setForm(prev => {
    const arr = [...(prev[key] || [])];
    arr[idx] = { ...arr[idx], [field]: val };
    return { ...prev, [key]: arr };
  });

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" });

  const next = () => { setStep(s => Math.min(s + 1, 5)); scrollTop(); };
  const back = () => { setStep(s => Math.max(s - 1, 1)); scrollTop(); };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const range = BUDGET_RANGES.find(b => b.id === form.budgetRange)?.label || form.budgetRange;
      const budgetLabel = range ? `${form.budgetCurrency} ${range}` : "";
      const payload = { ...form, budgetRange: budgetLabel, designerSlug: slug };
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Generation failed");
      setBrief(data.brief);
      setTags(data.tags);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - (form.uploads || []).length;
    const toProcess = files.slice(0, remaining);
    const newUploads = await Promise.all(
      toProcess.map(async f => {
        const { base64, mediaType } = await readImg(f);
        return { base64, mediaType, label: f.name };
      })
    );
    set("uploads", [...(form.uploads || []), ...newUploads]);
  };

  // ─── Chip component ───────────────────────────────────────────────────────
  const Chip = ({ selected, label, onClick }) => (
    <button type="button" onClick={onClick}
      style={{
        background: selected ? acc : "#f8fafc",
        color: selected ? "#fff" : "#334155",
        border: `1px solid ${selected ? acc : "#e2e8f0"}`,
        borderRadius: 4, padding: "8px 16px",
        fontFamily: `'${bodyFont}',sans-serif`, fontSize: 13,
        cursor: "pointer", transition: "all .15s",
      }}>
      {label}
    </button>
  );

  // ─── Radio component ──────────────────────────────────────────────────────
  const Radio = ({ name, value, checked, label, onChange }) => (
    <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, color:"#334155", fontFamily:`'${bodyFont}',sans-serif` }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange}
        style={{ accentColor:acc }}/>
      {label}
    </label>
  );

  // ─── Step progress ────────────────────────────────────────────────────────
  const StepBar = () => (
    <div style={{ display:"flex", gap:4, marginBottom:32 }}>
      {STEP_LABELS.map((label, i) => (
        <div key={i} style={{ flex:1, textAlign:"center" }}>
          <div style={{
            height:3, borderRadius:2, marginBottom:6,
            background: i + 1 <= step ? acc : "#e2e8f0",
            transition: "background .2s",
          }}/>
          <span style={{
            fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase",
            color: i + 1 <= step ? acc : "#94a3b8",
            fontFamily:`'${bodyFont}',sans-serif`, fontWeight: i + 1 === step ? 600 : 400,
          }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );

  // ─── Submitted view ───────────────────────────────────────────────────────
  if (submitted && brief) {
    return (
      <div style={{ minHeight:"100vh", background:bgColor, padding:"40px 20px" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          body{background:${bgColor};font-family:'${bodyFont}',sans-serif}
        `}</style>
        <div style={{ maxWidth:740, margin:"0 auto", background:"#fff", borderRadius:8, padding:"48px 52px", boxShadow:"0 1px 3px rgba(0,0,0,.04),0 8px 40px rgba(0,0,0,.07)" }}>
          <div style={{ height:3, background:acc, marginBottom:20, borderRadius:2 }}/>
          {brand?.logo_url
            ? <img src={brand.logo_url} alt={brand.studio_name} style={{ maxHeight:48, maxWidth:160, objectFit:"contain", display:"block", marginBottom:14 }}/>
            : <div style={{ fontSize:9, letterSpacing:"0.28em", textTransform:"uppercase", color:acc, fontWeight:600, marginBottom:14 }}>{brand?.studio_name || "Web Design Brief"}</div>
          }
          <div style={{ fontFamily:`'${headFont}',sans-serif`, fontSize:32, fontWeight:600, color:"#0f172a", marginBottom:8 }}>
            Thank you, {form.contactName.split(" ")[0]}!
          </div>
          <p style={{ fontSize:14, color:"#64748b", lineHeight:1.7, marginBottom:28 }}>
            Your web design brief has been generated and sent to {brand?.studio_name || "the designer"}.
            Here's a preview of what was created:
          </p>
          <BriefDisplay brief={brief} tags={tags} accent={acc} />
        </div>
      </div>
    );
  }

  // ─── Form view ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:bgColor, padding:"40px 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Cormorant+Garamond:wght@400;700&family=Playfair+Display:wght@400;700&family=EB+Garamond:wght@400;700&family=Lora:wght@400;700&family=Libre+Baskerville:wght@400;700&family=DM+Sans:wght@400;500&family=Jost:wght@400;500&family=Karla:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${bgColor};font-family:'${bodyFont}',sans-serif}
        input:focus,textarea:focus,select:focus{border-color:${acc}!important;background:#fff!important;outline:none}
      `}</style>

      <div ref={topRef} style={{ maxWidth:640, margin:"0 auto", background:formBg, borderRadius:8, padding:"44px 48px", boxShadow:"0 1px 3px rgba(0,0,0,.04),0 8px 40px rgba(0,0,0,.07)" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          {brand?.logo_url
            ? <img src={brand.logo_url} alt={brand.studio_name} style={{ maxHeight:48, maxWidth:160, objectFit:"contain", display:"block", margin:"0 auto 12px" }}/>
            : <div style={{ width:40, height:40, borderRadius:6, background:acc, display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:18, marginBottom:12 }}>W</div>
          }
          <div style={{ fontFamily:`'${headFont}',sans-serif`, fontSize:24, fontWeight:600, color:"#0f172a", marginBottom:4 }}>
            {brand?.studio_name || "Web Design Brief"}
          </div>
          {brand?.tagline && <p style={{ fontSize:13, color:"#64748b" }}>{brand.tagline}</p>}
        </div>

        <StepBar />

        {error && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:4, padding:"12px 14px", marginBottom:16, fontSize:13, color:"#dc2626" }}>
            {error}
          </div>
        )}

        {/* ── Step 1: Business & Goals ─────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily:`'${headFont}',sans-serif`, fontSize:20, fontWeight:600, color:"#0f172a", marginBottom:4 }}>Business & Goals</div>
            <p style={{ fontSize:13, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>Tell us about your business and what you want to achieve.</p>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Business Name *</label>
              <input style={inp} value={form.businessName} onChange={e => set("businessName", e.target.value)} placeholder="Acme Corp"/>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Industry *</label>
              <select style={inp} value={form.industry} onChange={e => set("industry", e.target.value)}>
                <option value="">Select your industry…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div>
                <label style={lbl}>Your Name *</label>
                <input style={inp} value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="Jane Smith"/>
              </div>
              <div>
                <label style={lbl}>Email *</label>
                <input type="email" style={inp} value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="jane@acme.com"/>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div>
                <label style={lbl}>Phone</label>
                <input style={inp} value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="+41 79 123 4567"/>
              </div>
              <div>
                <label style={lbl}>Current Website</label>
                <input style={inp} value={form.currentUrl} onChange={e => set("currentUrl", e.target.value)} placeholder="https://acme.com"/>
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Primary Goal *</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {PRIMARY_GOALS.map(g => (
                  <Chip key={g} label={g} selected={form.primaryGoal === g} onClick={() => set("primaryGoal", g)}/>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Target Audience</label>
              <textarea style={{ ...inp, minHeight:70, resize:"vertical" }} value={form.targetAudience} onChange={e => set("targetAudience", e.target.value)}
                placeholder="Who are your ideal customers? Age, interests, location…"/>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Competitors / Sites You Admire (up to 3)</label>
              {form.competitors.map((c, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                  <input style={inp} value={c.url} onChange={e => setNested("competitors", i, "url", e.target.value)} placeholder={`competitor${i+1}.com`}/>
                  <input style={inp} value={c.notes} onChange={e => setNested("competitors", i, "notes", e.target.value)} placeholder="What do you like about it?"/>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:28 }}>
              <button style={{ ...btnP, opacity: (!form.businessName || !form.contactName || !form.contactEmail || !form.primaryGoal) ? 0.45 : 1 }}
                disabled={!form.businessName || !form.contactName || !form.contactEmail || !form.primaryGoal}
                onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Project Scope ────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily:`'${headFont}',sans-serif`, fontSize:20, fontWeight:600, color:"#0f172a", marginBottom:4 }}>Project Scope</div>
            <p style={{ fontSize:13, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>What kind of website do you need?</p>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Project Type *</label>
              <div style={{ display:"flex", gap:12 }}>
                <Radio name="projectType" value="new" checked={form.projectType === "new"} label="New website" onChange={() => set("projectType", "new")}/>
                <Radio name="projectType" value="redesign" checked={form.projectType === "redesign"} label="Redesign existing site" onChange={() => set("projectType", "redesign")}/>
              </div>
            </div>

            {form.projectType === "redesign" && (
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>What's not working with your current site?</label>
                <textarea style={{ ...inp, minHeight:70, resize:"vertical" }} value={form.painPoints} onChange={e => set("painPoints", e.target.value)}
                  placeholder="Outdated design, slow load times, not mobile-friendly, can't find anything…"/>
              </div>
            )}

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Estimated Number of Pages</label>
              <input type="number" min="1" max="100" style={{ ...inp, maxWidth:120 }} value={form.pageCount} onChange={e => set("pageCount", e.target.value)} placeholder="5–10"/>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Features Needed</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {FEATURES.map(f => (
                  <Chip key={f} label={f} selected={form.features.includes(f)} onClick={() => toggleArr("features", f)}/>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Integrations / Third-party Tools</label>
              <textarea style={{ ...inp, minHeight:60, resize:"vertical" }} value={form.integrations} onChange={e => set("integrations", e.target.value)}
                placeholder="Mailchimp, Stripe, Calendly, HubSpot, Google Analytics…"/>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>CMS Preference</label>
              <select style={inp} value={form.cmsPreference} onChange={e => set("cmsPreference", e.target.value)}>
                <option value="">Select or leave open…</option>
                {CMS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
              <button style={btnG} onClick={back}>Back</button>
              <button style={btnP} onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Content & SEO ────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <div style={{ fontFamily:`'${headFont}',sans-serif`, fontSize:20, fontWeight:600, color:"#0f172a", marginBottom:4 }}>Content & SEO</div>
            <p style={{ fontSize:13, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>Do you have content ready? What are your search visibility goals?</p>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Content Readiness</label>
              <p style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>For each content type, select its status:</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {CONTENT_CATEGORIES.map(cat => (
                  <div key={cat} style={{ display:"grid", gridTemplateColumns:"180px 1fr", gap:8, alignItems:"center" }}>
                    <span style={{ fontSize:13, color:"#334155" }}>{cat}</span>
                    <div style={{ display:"flex", gap:6 }}>
                      {["Ready", "Needs work", "Don't have"].map(status => (
                        <button key={status} type="button"
                          onClick={() => set("contentReadiness", { ...form.contentReadiness, [cat]: status })}
                          style={{
                            padding:"5px 12px", fontSize:11, borderRadius:3, cursor:"pointer",
                            fontFamily:`'${bodyFont}',sans-serif`,
                            background: form.contentReadiness[cat] === status ? acc : "#f8fafc",
                            color: form.contentReadiness[cat] === status ? "#fff" : "#64748b",
                            border: `1px solid ${form.contentReadiness[cat] === status ? acc : "#e2e8f0"}`,
                          }}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div>
                <label style={lbl}>Need Copywriting Help?</label>
                <textarea style={{ ...inp, minHeight:60, resize:"vertical" }} value={form.copywritingNeeds} onChange={e => set("copywritingNeeds", e.target.value)}
                  placeholder="Yes, I need help with all pages / Just homepage / No, I have everything…"/>
              </div>
              <div>
                <label style={lbl}>Need Photography / Video?</label>
                <textarea style={{ ...inp, minHeight:60, resize:"vertical" }} value={form.photographyNeeds} onChange={e => set("photographyNeeds", e.target.value)}
                  placeholder="Yes, need product shots / Have some photos / Have a brand shoot planned…"/>
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Current SEO Status</label>
              <textarea style={{ ...inp, minHeight:60, resize:"vertical" }} value={form.currentSeo} onChange={e => set("currentSeo", e.target.value)}
                placeholder="Do you currently rank for any keywords? Have you done SEO before?"/>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>SEO Goals</label>
              <textarea style={{ ...inp, minHeight:60, resize:"vertical" }} value={form.seoGoals} onChange={e => set("seoGoals", e.target.value)}
                placeholder="Rank locally for 'web design Zurich', increase organic traffic, target specific keywords…"/>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
              <div>
                <label style={lbl}>Google Business Profile</label>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {["Yes", "No", "Not sure"].map(v => (
                    <Radio key={v} name="gbp" value={v} checked={form.googleBusiness === v} label={v} onChange={() => set("googleBusiness", v)}/>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Analytics Setup</label>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {["Yes", "No", "Not sure"].map(v => (
                    <Radio key={v} name="analytics" value={v} checked={form.analytics === v} label={v} onChange={() => set("analytics", v)}/>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Domain Status</label>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {["Have it", "Need one", "Transferring"].map(v => (
                    <Radio key={v} name="domain" value={v} checked={form.domainStatus === v} label={v} onChange={() => set("domainStatus", v)}/>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
              <button style={btnG} onClick={back}>Back</button>
              <button style={btnP} onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Design Preferences & Brand ───────────────────────────── */}
        {step === 4 && (
          <div>
            <div style={{ fontFamily:`'${headFont}',sans-serif`, fontSize:20, fontWeight:600, color:"#0f172a", marginBottom:4 }}>Design & Brand</div>
            <p style={{ fontSize:13, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>Help us understand your visual direction and brand identity.</p>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Visual Style (select all that apply)</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {VISUAL_STYLES.map(s => (
                  <Chip key={s.id} label={s.label} selected={form.visualStyles.includes(s.id)} onClick={() => toggleArr("visualStyles", s.id)}/>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Reference Sites (up to 3)</label>
              <p style={{ fontSize:12, color:"#94a3b8", marginBottom:8 }}>Share websites you like and what specifically appeals to you.</p>
              {form.referenceSites.map((r, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                  <input style={inp} value={r.url} onChange={e => setNested("referenceSites", i, "url", e.target.value)} placeholder={`https://example${i+1}.com`}/>
                  <input style={inp} value={r.notes} onChange={e => setNested("referenceSites", i, "notes", e.target.value)} placeholder="What do you like about it?"/>
                </div>
              ))}
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Existing Brand Assets</label>
              <textarea style={{ ...inp, minHeight:60, resize:"vertical" }} value={form.brandAssets} onChange={e => set("brandAssets", e.target.value)}
                placeholder="Do you have a logo, brand guidelines, colour palette, or fonts?"/>
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Tone of Voice (select up to 2)</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {TONE_OPTIONS.map(t => (
                  <Chip key={t} label={t}
                    selected={form.toneOfVoice.includes(t)}
                    onClick={() => {
                      if (form.toneOfVoice.includes(t)) {
                        set("toneOfVoice", form.toneOfVoice.filter(v => v !== t));
                      } else if (form.toneOfVoice.length < 2) {
                        set("toneOfVoice", [...form.toneOfVoice, t]);
                      }
                    }}/>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Upload Assets (logo, brand guide, inspiration — max 5 files)</label>
              <label style={{ display:"flex", alignItems:"center", gap:8, border:"1px dashed #e2e8f0", borderRadius:4, padding:"12px 14px", cursor:"pointer", background:"#f8fafc" }}>
                <span style={{ fontSize:13, color:"#94a3b8" }}>Click to upload files…</span>
                <input type="file" multiple accept="image/*,.pdf,.svg" style={{ display:"none" }} onChange={handleFileUpload}/>
              </label>
              {form.uploads.length > 0 && (
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:8 }}>
                  {form.uploads.map((u, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:6, background:"#f1f5f9", borderRadius:4, padding:"6px 10px", fontSize:12, color:"#334155" }}>
                      <span>{u.label}</span>
                      <button type="button" onClick={() => set("uploads", form.uploads.filter((_, j) => j !== i))}
                        style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:14, lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
              <button style={btnG} onClick={back}>Back</button>
              <button style={btnP} onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* ── Step 5: Budget & Timeline ────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <div style={{ fontFamily:`'${headFont}',sans-serif`, fontSize:20, fontWeight:600, color:"#0f172a", marginBottom:4 }}>Budget & Timeline</div>
            <p style={{ fontSize:13, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>Help us understand your investment range and timeline expectations.</p>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Currency</label>
              <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                {CURRENCIES.map(c => (
                  <Chip key={c} label={c} selected={form.budgetCurrency === c} onClick={() => set("budgetCurrency", c)}/>
                ))}
              </div>
              <label style={lbl}>Budget Range ({form.budgetCurrency})</label>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {BUDGET_RANGES.map(b => (
                  <Radio key={b.id} name="budget" value={b.id} checked={form.budgetRange === b.id} label={`${form.budgetCurrency} ${b.label}`} onChange={() => set("budgetRange", b.id)}/>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Desired Launch Date</label>
              <input type="date" style={{ ...inp, maxWidth:200 }} value={form.launchDate} onChange={e => set("launchDate", e.target.value)}/>
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Interested in Ongoing Maintenance?</label>
              <div style={{ display:"flex", gap:12 }}>
                {["Yes", "No", "Maybe"].map(v => (
                  <Radio key={v} name="maintenance" value={v} checked={form.maintenanceInterest === v} label={v} onChange={() => set("maintenanceInterest", v)}/>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Decision Makers</label>
              <textarea style={{ ...inp, minHeight:50, resize:"vertical" }} value={form.decisionMakers} onChange={e => set("decisionMakers", e.target.value)}
                placeholder="Who needs to approve the design? Just me / Business partner / Marketing team…"/>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={lbl}>How Did You Find Us?</label>
              <select style={inp} value={form.referralSource} onChange={e => set("referralSource", e.target.value)}>
                <option value="">Select…</option>
                {REFERRAL_SOURCES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
              <button style={btnG} onClick={back}>Back</button>
              <button style={{ ...btnP, opacity: loading ? 0.45 : 1 }} onClick={handleSubmit} disabled={loading}>
                {loading ? "Generating brief…" : "Submit & Generate Brief"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
