'use strict';

function buildContractPrompt(formData, quote, designer) {
  const currency = quote.currency || 'CHF';

  const pagesDetail = (formData.pages || [])
    .filter(p => p.name)
    .map(p => `  - ${p.name} (${p.type}): ${p.purpose || 'General page'}`)
    .join('\n') || '  As specified in quote line items';

  const lineItemsStr = (quote.lineItems || [])
    .map(li => `  - ${li.item}: ${li.quantity}x ${currency} ${li.unitPrice} = ${currency} ${li.total}`)
    .join('\n');

  return `You are a web design project manager generating a scope of work / contract document. Based on the client's intake form and the approved quote, generate a structured contract.

CLIENT & PROJECT:
Business: ${formData.businessName} (${formData.industry})
Contact: ${formData.contactName} (${formData.contactEmail})
Project type: ${formData.projectType === 'redesign' ? 'Redesign' : 'New website'}
Pages:
${pagesDetail}
Features: ${(formData.features || []).join(', ') || 'None'}
Integrations: ${formData.integrations || 'None'}
CMS: ${formData.cmsPreference || 'Per recommendation'}

RESPONSIBILITIES (as stated by client):
Hosting: ${formData.hostingResponsibility || 'To be discussed'}
Domain: ${formData.domainResponsibility || 'To be discussed'}
Legal pages: ${formData.legalPagesResponsibility || 'To be discussed'}
Accessibility: ${formData.accessibilityLevel || 'None specified'}
Content provider: ${formData.contentResponsibility || 'To be discussed'}
Content deadline: ${formData.contentDeadline || 'To be discussed'}

PROCESS (as stated by client):
Revision rounds: ${formData.revisionRounds || 'To be defined'}
Approval process: ${formData.approvalProcess || 'To be defined'}
Decision makers: ${formData.decisionMakers || 'Not specified'}
Post-launch training: ${formData.postLaunchTraining || 'No'}
Post-launch docs: ${formData.postLaunchDocs || 'No'}
Maintenance: ${formData.maintenanceScope || 'None'}
Client exclusions: ${formData.exclusions || 'None stated'}

APPROVED QUOTE:
${lineItemsStr}
Subtotal: ${currency} ${quote.subtotal}
Complexity: ${quote.complexityLevel} (${quote.complexityMultiplier}x)
Total: ${currency} ${quote.total}
Estimated hours: ${quote.estimatedHours}

DESIGNER:
Studio: ${designer.studio_name}
Launch date: ${formData.launchDate || 'To be agreed'}

Return ONLY valid JSON. No explanation, no markdown, no backticks.
{
  "scopeOfWork": "2-3 paragraph description of the project scope, what will be built, and key objectives",
  "deliverables": [
    { "item": "Homepage design & development", "description": "Full-width landing page with hero section, services overview, testimonials, and call-to-action" }
  ],
  "exclusions": [
    "Stock photography licensing",
    "Hosting setup and ongoing hosting costs",
    "Domain registration or transfer"
  ],
  "revisionPolicy": {
    "designRevisions": 2,
    "developmentRevisions": 1,
    "additionalRate": ${quote.lineItems?.[0]?.unitPrice ? Math.round(quote.total / quote.estimatedHours) : 120},
    "description": "Each revision round includes feedback on the full deliverable. Additional revisions beyond the included rounds are billed at the hourly rate."
  },
  "timeline": {
    "totalWeeks": 8,
    "milestones": [
      { "phase": "Discovery & Planning", "weeks": "1-2", "deliverable": "Sitemap, wireframes, design brief review" }
    ]
  },
  "paymentSchedule": [
    { "milestone": "Project kickoff", "percentage": 30, "amount": ${Math.round(quote.total * 0.3)} },
    { "milestone": "Design approval", "percentage": 30, "amount": ${Math.round(quote.total * 0.3)} },
    { "milestone": "Development complete", "percentage": 30, "amount": ${Math.round(quote.total * 0.3)} },
    { "milestone": "Launch & handover", "percentage": 10, "amount": ${Math.round(quote.total * 0.1)} }
  ],
  "changeRequestProcess": "Any changes outside the agreed scope will be documented as a change request with an estimated cost and timeline impact. Change requests require written approval before work begins.",
  "ipTransfer": "Upon receipt of final payment, all intellectual property rights for custom design work and code developed specifically for this project transfer to the client. Third-party licenses (plugins, fonts, stock assets) remain subject to their respective license terms.",
  "cancellationTerms": "Either party may terminate with 14 days written notice. Client owes for all work completed to date. Deposits are non-refundable after the Discovery phase begins.",
  "warranty": "30-day warranty period after launch covering bugs and defects in the delivered work. Does not cover changes to third-party services, hosting issues, or new feature requests."
}

Rules:
- Deliverables must match the actual pages and features from the intake form and quote
- Exclusions should include everything NOT in the quote (hosting, domain, stock photos, content writing if not quoted, etc.)
- Revision policy should reflect what the client indicated in the intake form
- Timeline milestones should be realistic for the project scope
- Payment schedule percentages must sum to 100
- Payment amounts should approximately match the quote total
- Be specific and professional — this document will be used as a real contract starting point
- Include 4-6 milestones in the timeline
- Include 5-10 exclusions (be thorough — this prevents scope creep)`;
}

module.exports = { buildContractPrompt };
