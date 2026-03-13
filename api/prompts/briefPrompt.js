'use strict';

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

  const pagesStr = (d.pages || [])
    .filter(p => p.name)
    .map((p, i) => `  ${i+1}. ${p.name} (${p.type}) — ${p.purpose || 'No purpose specified'}`)
    .join('\n') || '  Not specified (estimated count: ' + (d.pageCount || 'unknown') + ')';

  const thirdPartyStr = (d.thirdPartyAccess || []).join(', ') || 'None specified';

  const hasEcommerce = (d.features || []).some(f =>
    f.toLowerCase().includes('e-commerce') || f.toLowerCase().includes('shop')
  );

  const ecommerceBlock = hasEcommerce ? `
E-COMMERCE DETAILS:
Product count: ${d.ecommerceProductCount || 'Not specified'}
Product types: ${(d.ecommerceProductTypes || []).join(', ') || 'Not specified'}
Payment gateways: ${(d.ecommercePaymentGateways || []).join(', ') || 'Not specified'}
Shipping: ${d.ecommerceShipping || 'Not specified'}
Inventory management: ${d.ecommerceInventory || 'Not specified'}
Product import: ${d.ecommerceImport || 'Not specified'}` : '';

  return `You are a senior web design consultant. Write a personalised web design brief to be read by THE DESIGNER preparing for a client meeting.

TONE:
- Address the designer in second person: "your client", "their business", "the project".
- Professional, concise, and actionable. Like a senior colleague handing you a project summary before a meeting.

FORMAT RULES — non-negotiable:
- Write exactly these nine section headers, each on its own line, numbered like "1. Project Overview"
  1. Project Overview
  2. Design Direction
  3. Sitemap & Page Specifications
  4. Content Status and Plan
  5. SEO Assessment and Strategy
  6. Technical Scope
  7. Responsibilities & Access
  8. Process & Timeline
  9. Designer Notes & Risk Flags
- Under each section header, write 3–6 bullet points
- Each bullet starts with "- " (dash space)
- Each bullet: one clear, actionable point. Max 20 words per bullet.
- No sub-bullets. No paragraphs. Only bullets under each header.
- Total: 45–65 bullets across all sections
- Do not pad or repeat information. Make every bullet count.
- No markdown formatting (no bold, no asterisks). Just plain text with "- " bullets.

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
${d.projectType === 'redesign' && d.contentMigration ? `Content migration needs: "${d.contentMigration}"` : ''}

PAGE SPECIFICATIONS:
${pagesStr}

Features requested: ${(d.features || []).length > 0 ? d.features.join(', ') : 'None specified'}
Integrations: ${d.integrations || 'None specified'}
CMS preference: ${d.cmsPreference || 'Open to recommendation'}

Content readiness:
${contentStr}
Content responsibility: ${d.contentResponsibility || 'Not specified'}
Content deadline: ${d.contentDeadline || 'Not specified'}
Copywriting needs: ${d.copywritingNeeds || 'Not specified'}
Photography/video needs: ${d.photographyNeeds || 'Not specified'}
Current SEO status: ${d.currentSeo || 'Unknown'}
SEO goals: ${d.seoGoals || 'Not specified'}
Google Business Profile: ${d.googleBusiness || 'Unknown'}
Analytics setup: ${d.analytics || 'Unknown'}
Domain: ${d.domainStatus || 'Not specified'}

Visual styles: ${(d.visualStyles || []).length > 0 ? d.visualStyles.join(', ') : 'Not specified'}
Reference sites:
${refSiteStr}
Brand assets: ${d.brandAssets || 'Not provided'}
Tone of voice: ${(d.toneOfVoice || []).length > 0 ? d.toneOfVoice.join(', ') : 'Not specified'}

RESPONSIBILITIES:
Hosting: ${d.hostingResponsibility || 'Not specified'}
Domain management: ${d.domainResponsibility || 'Not specified'}
Third-party access needed: ${thirdPartyStr}
Legal pages (privacy, cookies, terms): ${d.legalPagesResponsibility || 'Not specified'}
Accessibility: ${d.accessibilityLevel || 'Not specified'}

PROCESS:
Revision rounds: ${d.revisionRounds || 'Not specified'}
Approval process: ${d.approvalProcess || 'Not specified'}
Decision makers: ${d.decisionMakers || 'Not specified'}
Post-launch training: ${d.postLaunchTraining || 'Not specified'}
Post-launch documentation: ${d.postLaunchDocs || 'Not specified'}
Maintenance scope: ${d.maintenanceScope || 'Not specified'}
Client-stated exclusions: ${d.exclusions || 'None'}
${ecommerceBlock}

Budget: ${d.budgetRange || 'Not specified'}
Launch date: ${d.launchDate || 'Not specified'}
Referral source: ${d.referralSource || 'Not specified'}
Additional comments: ${d.additionalComments || 'None'}

Begin immediately with: 1. Project Overview

After the nine sections, append exactly this block:
[TAGS]
{"keywords":["Word","Word","Word","Word"],"techStack":["Tech","Tech","Tech"],"contentGaps":["Gap","Gap","Gap"],"riskFlags":["Flag","Flag","Flag"]}
[/TAGS]
Rules for tags:
- keywords: 4 single-word or short descriptors summarising the project direction
- techStack: 3–4 recommended technologies (CMS, frameworks, tools)
- contentGaps: 3 specific content items the client needs to provide or create
- riskFlags: 2–3 constraints or risks the designer should watch for (include scope creep risks)`;
}

module.exports = { buildBriefPrompt };
