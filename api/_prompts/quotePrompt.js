'use strict';

function buildQuotePrompt(formData, rates) {
  const currency = rates.currency || 'CHF';

  const pagesDetail = (formData.pages || [])
    .filter(p => p.name)
    .map(p => `  - ${p.name} (${p.type})`)
    .join('\n') || '  Not specified';

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
Pages requested:
${pagesDetail}
Features: ${(formData.features || []).join(', ') || 'None'}
Integrations: ${formData.integrations || 'None'}
CMS: ${formData.cmsPreference || 'Not specified'}
Content readiness: ${JSON.stringify(formData.contentReadiness || {})}
Copywriting needs: ${formData.copywritingNeeds || 'None'}
Photography needs: ${formData.photographyNeeds || 'None'}
SEO goals: ${formData.seoGoals || 'None'}
Maintenance interest: ${formData.maintenanceScope || formData.maintenanceInterest || 'No'}
Budget range: ${formData.budgetRange || 'Not specified'}
Revision rounds: ${formData.revisionRounds || 'Not specified'}

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
- Use the page specifications to determine exact page types and quantities
- Calculate totals correctly (quantity x unitPrice x complexityMultiplier for final total)
- Apply complexity based on: features count, integrations, e-commerce, multi-language
- If copywriting is needed, estimate pages that need it based on content readiness
- Include a training session if the client is new to their CMS
- Be conservative but fair — round to nearest 50
- The notes field should mention what is NOT included (e.g. hosting, domain, stock photos)`;
}

module.exports = { buildQuotePrompt };
