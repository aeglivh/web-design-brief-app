'use strict';

const { z } = require('zod');

// ── CORS ─────────────────────────────────────────────────────────────────────

function applyCors(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',').map(s => s.trim());
  const origin = req.headers.origin;
  if (!origin || allowed.includes('*') || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ── Auth helper ──────────────────────────────────────────────────────────────

async function getUser(req) {
  const supabase = require('./lib/supabase');
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

// ── Zod validation schemas ───────────────────────────────────────────────────

const s = (max = 500) => z.string().max(max).transform(v => v.trim());

const generateSchema = z.object({
  // Step 1 — Business & Goals
  businessName:    s(200),
  industry:        s(100),
  contactName:     s(120),
  contactEmail:    z.string().email().max(254),
  contactPhone:    s(30).default(''),
  currentUrl:      s(500).default(''),
  primaryGoal:     s(100),
  targetAudience:  s(1500).default(''),
  competitors:     z.array(z.object({
    url:   s(500).default(''),
    notes: s(300).default(''),
  })).max(3).default([]),

  // Step 2 — Project Scope
  projectType:     s(20), // "new" or "redesign"
  painPoints:      s(1500).default(''),
  pageCount:       s(10).default(''),
  features:        z.array(s(60)).max(20).default([]),
  integrations:    s(1000).default(''),
  cmsPreference:   s(60).default(''),

  // Step 3 — Content & SEO
  contentReadiness: z.record(z.string(), s(30)).default({}),
  copywritingNeeds: s(1000).default(''),
  photographyNeeds: s(1000).default(''),
  currentSeo:       s(1000).default(''),
  seoGoals:         s(1000).default(''),
  googleBusiness:   s(20).default(''),
  analytics:        s(20).default(''),
  domainStatus:     s(30).default(''),

  // Step 4 — Design Preferences & Brand
  visualStyles:    z.array(s(60)).max(8).default([]),
  referenceSites:  z.array(z.object({
    url:   s(500).default(''),
    notes: s(500).default(''),
  })).max(3).default([]),
  brandAssets:     s(1000).default(''),
  toneOfVoice:     z.array(s(60)).max(4).default([]),
  uploads:         z.array(z.object({
    base64:    z.string().max(6_000_000),
    mediaType: z.string(),
    label:     s(60).default(''),
  })).max(5).default([]),

  // Step 5 — Budget & Timeline
  budgetRange:     s(60).default(''),
  launchDate:      s(30).default(''),
  maintenanceInterest: s(20).default(''),
  decisionMakers:  s(500).default(''),
  referralSource:  s(200).default(''),

  // Meta
  designerSlug:    s(80).optional(),
});

const emailSchema = z.object({
  clientEmail:   z.string().email().max(254),
  designerEmail: z.string().email().max(254).optional().nullable(),
  clientName:    s(120),
  studioName:    s(120),
  briefText:     s(15_000),
  businessName:  s(200),
  budget:        s(80),
});

const ratesSchema = z.object({
  page_rates: z.object({
    landing:    z.number().min(0),
    inner:      z.number().min(0),
    blog:       z.number().min(0),
    ecommerce:  z.number().min(0),
  }),
  addon_rates: z.object({
    contactForm:    z.number().min(0),
    gallery:        z.number().min(0),
    newsletter:     z.number().min(0),
    seo:            z.number().min(0),
    booking:        z.number().min(0),
    ecommerce:      z.number().min(0),
    livechat:       z.number().min(0),
    multilanguage:  z.number().min(0),
    blog:           z.number().min(0),
    copywriting:    z.number().min(0),
    photography:    z.number().min(0),
    maintenance:    z.number().min(0),
    training:       z.number().min(0),
  }),
  hourly_rate: z.number().min(0),
  multipliers: z.object({
    simple:   z.number().min(0),
    moderate: z.number().min(0),
    complex:  z.number().min(0),
  }),
  currency: z.string().max(10).default('CHF'),
});

// ── Brief prompt builder ─────────────────────────────────────────────────────

function buildBriefPrompt(d) {
  const competitorStr = (d.competitors || [])
    .filter(c => c.url)
    .map((c, i) => `  ${i+1}. ${c.url}${c.notes ? ` — "${c.notes}"` : ''}`)
    .join('\n') || '  None provided';

  const refSiteStr = (d.referenceSites || [])
    .filter(r => r.url)
    .map((r, i) => `  ${i+1}. ${r.url}${r.notes ? ` — "${r.notes}"` : ''}`)
    .join('\n') || '  None provided';

  const contentStr = Object.entries(d.contentReadiness || {})
    .map(([cat, status]) => `  ${cat}: ${status}`)
    .join('\n') || '  Not specified';

  return `You are a senior web design consultant. Write a personalised web design brief to be read by THE DESIGNER preparing for a client meeting.

TONE:
- Address the designer in second person: "your client", "their business", "the project".
- Professional, concise, and actionable. Like a senior colleague handing you a project summary before a meeting.

FORMAT RULES — non-negotiable:
- Plain text only. No markdown. No asterisks, hashes, dashes, or bullets.
- Write exactly these seven section headers, each on its own line:
  1. Project Overview
  2. Design Direction
  3. Sitemap Recommendation
  4. Content Status and Plan
  5. SEO Assessment and Strategy
  6. Technical Scope
  7. Designer Notes
- 7 sections, exactly 1–2 paragraphs each
- Each paragraph: 2–3 sentences max
- Each sentence under 25 words
- Total word count: 300–450 words
- Do not pad or repeat information. Make every word count.

PROJECT DATA:
Business: ${d.businessName}
Industry: ${d.industry}
Contact: ${d.contactName} (${d.contactEmail}${d.contactPhone ? ', ' + d.contactPhone : ''})
Current website: ${d.currentUrl || 'None'}
Primary goal: ${d.primaryGoal}
Target audience: ${d.targetAudience || 'Not specified'}
Competitors:
${competitorStr}

Project type: ${d.projectType === 'redesign' ? 'Redesign' : 'New website'}
${d.projectType === 'redesign' && d.painPoints ? `Pain points with current site: "${d.painPoints}"` : ''}
Estimated pages: ${d.pageCount || 'Not specified'}
Features requested: ${d.features.length > 0 ? d.features.join(', ') : 'None specified'}
Integrations: ${d.integrations || 'None specified'}
CMS preference: ${d.cmsPreference || 'Open to recommendation'}

Content readiness:
${contentStr}
Copywriting needs: ${d.copywritingNeeds || 'Not specified'}
Photography/video needs: ${d.photographyNeeds || 'Not specified'}
Current SEO status: ${d.currentSeo || 'Unknown'}
SEO goals: ${d.seoGoals || 'Not specified'}
Google Business Profile: ${d.googleBusiness || 'Unknown'}
Analytics setup: ${d.analytics || 'Unknown'}
Domain: ${d.domainStatus || 'Not specified'}

Visual styles: ${d.visualStyles.length > 0 ? d.visualStyles.join(', ') : 'Not specified'}
Reference sites:
${refSiteStr}
Brand assets: ${d.brandAssets || 'Not provided'}
Tone of voice: ${d.toneOfVoice.length > 0 ? d.toneOfVoice.join(', ') : 'Not specified'}

Budget: ${d.budgetRange || 'Not specified'}
Launch date: ${d.launchDate || 'Not specified'}
Maintenance interest: ${d.maintenanceInterest || 'Not specified'}
Decision makers: ${d.decisionMakers || 'Not specified'}
Referral source: ${d.referralSource || 'Not specified'}

Begin immediately with: 1. Project Overview

After the seven sections, append exactly this block:
[TAGS]
{"keywords":["Word","Word","Word","Word"],"techStack":["Tech","Tech","Tech"],"contentGaps":["Gap","Gap","Gap"],"riskFlags":["Flag","Flag"]}
[/TAGS]
Rules for tags:
- keywords: 4 single-word or short descriptors summarising the project direction
- techStack: 3–4 recommended technologies (CMS, frameworks, tools)
- contentGaps: 3 specific content items the client needs to provide or create
- riskFlags: 2–3 constraints or risks the designer should watch for`;
}

// ── Quote prompt builder ─────────────────────────────────────────────────────

function buildQuotePrompt(formData, rates) {
  const currency = rates.currency || 'CHF';
  return `You are a web design project estimator. Based on the client's project requirements and the designer's rate card, generate an itemised quote.

DESIGNER RATE CARD (${currency}):
Page rates:
- Landing page: ${rates.page_rates.landing}
- Inner page: ${rates.page_rates.inner}
- Blog setup: ${rates.page_rates.blog}
- E-commerce page: ${rates.page_rates.ecommerce}

Add-on rates:
- Contact form: ${rates.addon_rates.contactForm}
- Gallery/portfolio: ${rates.addon_rates.gallery}
- Newsletter signup: ${rates.addon_rates.newsletter}
- SEO base setup: ${rates.addon_rates.seo}
- Booking system: ${rates.addon_rates.booking}
- E-commerce setup: ${rates.addon_rates.ecommerce}
- Live chat: ${rates.addon_rates.livechat}
- Multi-language: ${rates.addon_rates.multilanguage}
- Blog setup: ${rates.addon_rates.blog}
- Copywriting (per page): ${rates.addon_rates.copywriting}
- Photography coordination: ${rates.addon_rates.photography}
- Monthly maintenance: ${rates.addon_rates.maintenance}
- Training session: ${rates.addon_rates.training}

Hourly rate: ${rates.hourly_rate}
Complexity multipliers: Simple ${rates.multipliers.simple}x, Moderate ${rates.multipliers.moderate}x, Complex ${rates.multipliers.complex}x

CLIENT PROJECT:
Business: ${formData.businessName} (${formData.industry})
Project type: ${formData.projectType === 'redesign' ? 'Redesign' : 'New website'}
Estimated pages: ${formData.pageCount || 'Not specified'}
Features: ${(formData.features || []).join(', ') || 'None'}
Integrations: ${formData.integrations || 'None'}
CMS: ${formData.cmsPreference || 'Not specified'}
Content readiness: ${JSON.stringify(formData.contentReadiness || {})}
Copywriting needs: ${formData.copywritingNeeds || 'None'}
Photography needs: ${formData.photographyNeeds || 'None'}
SEO goals: ${formData.seoGoals || 'None'}
Maintenance interest: ${formData.maintenanceInterest || 'No'}
Budget range: ${formData.budgetRange || 'Not specified'}

Return ONLY valid JSON. No explanation, no markdown, no backticks.
{
  "lineItems": [
    { "item": "Description", "quantity": 1, "unitPrice": 0, "total": 0 }
  ],
  "subtotal": 0,
  "complexityLevel": "simple|moderate|complex",
  "complexityMultiplier": 1.0,
  "total": 0,
  "currency": "${currency}",
  "notes": "Brief note on assumptions or scope boundaries",
  "estimatedHours": 0
}

Rules:
- Only include line items that match the client's actual requirements
- Calculate totals correctly (quantity × unitPrice × complexityMultiplier for final total)
- Apply complexity based on: features count, integrations, e-commerce, multi-language
- If copywriting is needed, estimate pages that need it based on content readiness
- Include a training session if the client is new to their CMS
- Be conservative but fair — round to nearest 50
- The notes field should mention what is NOT included (e.g. hosting, domain, stock photos)`;
}

// ── Email HTML template ──────────────────────────────────────────────────────

function buildEmailHtml({ studioName, clientName, businessName, budget, briefText }) {
  const esc = str => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const bodyHtml = briefText.split('\n').map(line => {
    const t = line.trim();
    if (!t) return '<div style="height:10px"></div>';
    if (/^\d+[\.:]\s+\S/.test(t)) {
      return `<h2 style="font-family:Georgia,serif;font-size:17px;font-weight:700;color:#0f172a;background:#f1f5f9;padding:9px 14px;margin:32px 0 14px;border-left:3px solid #3b82f6">${esc(t)}</h2>`;
    }
    return `<p style="font-size:15px;line-height:1.9;color:#334155;font-family:Georgia,serif;margin:0 0 14px">${esc(t)}</p>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Web Design Brief — ${esc(studioName)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica Neue,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <tr><td style="background:#0f172a;padding:36px 48px">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#64748b">${esc(studioName)}</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;font-weight:400;color:#f8fafc;line-height:1.15">Web Design Brief</h1>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:18px 48px;border-bottom:1px solid #e2e8f0">
          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.8">
            <strong style="color:#0f172a">${esc(clientName)}</strong>
            &nbsp;·&nbsp;${esc(businessName)}&nbsp;·&nbsp;${esc(budget)}
          </p>
        </td></tr>
        <tr><td style="padding:36px 48px 24px">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 48px 28px;border-top:1px solid #e2e8f0">
          <p style="margin:0;font-size:11px;color:#94a3b8;letter-spacing:.06em">Generated by ${esc(studioName)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Designer notification email ──────────────────────────────────────────────

function buildDesignerNotificationEmail({ studioName, acc, clientName, clientEmail, businessName, industry, budget, pageCount, briefUrl }) {
  const esc = s => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>New Brief — ${esc(studioName)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica Neue,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
<tr><td style="background:${esc(acc)};padding:32px 48px">
  <p style="margin:0 0 8px;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#fff;opacity:.75">${esc(studioName)}</p>
  <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#fff;line-height:1.2">New Brief Ready</h1>
</td></tr>
<tr><td style="padding:32px 48px 0">
  <p style="margin:0 0 4px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8">Client</p>
  <p style="margin:0 0 4px;font-size:20px;font-family:Georgia,serif;color:#0f172a">${esc(clientName)}</p>
  ${clientEmail ? `<a href="mailto:${esc(clientEmail)}" style="font-size:13px;color:${esc(acc)};text-decoration:none">${esc(clientEmail)}</a>` : ''}
  <div style="height:1px;background:#e2e8f0;margin:20px 0"></div>
</td></tr>
<tr><td style="padding:0 48px">
  <table width="100%" cellpadding="0" cellspacing="0">
    ${businessName ? `<tr><td style="padding-bottom:12px;border-bottom:1px solid #f1f5f9"><span style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#94a3b8">Business</span><p style="margin:3px 0 0;font-size:14px;color:#334155">${esc(businessName)}</p></td></tr>` : ''}
    ${industry ? `<tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9"><span style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#94a3b8">Industry</span><p style="margin:3px 0 0;font-size:14px;color:#334155">${esc(industry)}</p></td></tr>` : ''}
    ${budget ? `<tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9"><span style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#94a3b8">Budget</span><p style="margin:3px 0 0;font-size:14px;color:#334155">${esc(budget)}</p></td></tr>` : ''}
    ${pageCount ? `<tr><td style="padding:12px 0"><span style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#94a3b8">Pages</span><p style="margin:3px 0 0;font-size:14px;color:#334155">${esc(pageCount)}</p></td></tr>` : ''}
  </table>
</td></tr>
<tr><td style="padding:28px 48px 40px;text-align:center">
  <a href="${esc(briefUrl)}" style="display:inline-block;background:${esc(acc)};color:#fff;text-decoration:none;padding:13px 32px;border-radius:4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase">View Brief</a>
</td></tr>
<tr><td style="padding:14px 48px 22px;border-top:1px solid #e2e8f0">
  <p style="margin:0;font-size:11px;color:#94a3b8;letter-spacing:.06em">${esc(studioName)} — brief notification</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

// ── Email sender ─────────────────────────────────────────────────────────────

async function sendEmail(payload) {
  const html    = buildEmailHtml(payload);
  const subject = `Your Web Design Brief — ${payload.studioName}`;
  const from    = process.env.EMAIL_FROM || `${payload.studioName} <hello@webdesignbrief.studio>`;
  const targets = [payload.clientEmail, payload.designerEmail].filter(Boolean);

  if (process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const results = await Promise.all(targets.map(to => resend.emails.send({ from, to, subject, html })));
    const errors = results.map(r => r.error).filter(Boolean);
    if (errors.length) {
      const msg = errors.map(e => e.message || JSON.stringify(e)).join('; ');
      throw new Error(`Resend error: ${msg}`);
    }
    return { sent: true, count: targets.length };
  }

  return { sent: false, reason: 'email_disabled' };
}

module.exports = {
  applyCors,
  getUser,
  generateSchema,
  emailSchema,
  ratesSchema,
  buildBriefPrompt,
  buildQuotePrompt,
  buildEmailHtml,
  buildDesignerNotificationEmail,
  sendEmail,
};
