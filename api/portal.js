'use strict';

const { applyCors } = require('./_helpers');
const supabase = require('./lib/supabase');

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { slug } = req.query || {};
  if (!slug) return res.status(400).json({ error: 'slug is required' });

  // Look up designer by slug
  const { data: designer, error: dErr } = await supabase
    .from('designers')
    .select('id, studio_name, slug, logo_url, accent_color, heading_font, body_font, form_bg_colour, dashboard_bar_colour, dashboard_bg_colour, tagline')
    .eq('slug', slug)
    .single();

  if (dErr || !designer) return res.status(404).json({ error: 'Studio not found' });

  // Find the most recent brief for this designer
  const { data: brief, error: bErr } = await supabase
    .from('briefs')
    .select('*')
    .eq('designer_id', designer.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!brief) return res.status(404).json({ error: 'No project found' });

  // If portal is paused, return minimal data
  if (brief.portal_paused) {
    return res.status(200).json({
      paused: true,
      designer_name: designer.studio_name,
      designer_logo: designer.logo_url,
    });
  }

  // Build the response — omit content for fields where *_visible is false
  const portalBrief = {
    id: brief.id,
    business_name: brief.business_name,
    client_name: brief.client_name,
    client_email: brief.client_email,
    industry: brief.industry,
    project_type: brief.project_type,
    portal_status: brief.portal_status,
    created_at: brief.created_at,
    signed_at: brief.signed_at,
    signed_name: brief.signed_name,
    deposit_url: brief.deposit_url,
    deposit_paid: brief.deposit_paid,
    completed_at: brief.completed_at,
    completion_message: brief.completion_message,
    brief_visible: brief.brief_visible,
    quote_visible: brief.quote_visible,
    contract_visible: brief.contract_visible,
    // Conditionally include content
    brief_text: brief.brief_visible ? brief.brief_text : null,
    tags: brief.brief_visible ? brief.tags : null,
    quote: brief.quote_visible ? brief.quote : null,
    project_phases: brief.project_phases || null,
  };

  // Load contract if visible
  let contract = null;
  if (brief.contract_visible) {
    const { data: c } = await supabase
      .from('contracts')
      .select('id, contract_data, status, created_at')
      .eq('brief_id', brief.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    contract = c || null;
  }

  // Load project updates
  const { data: updates } = await supabase
    .from('project_updates')
    .select('*')
    .eq('brief_id', brief.id)
    .order('created_at', { ascending: false });

  // Load project links
  const { data: links } = await supabase
    .from('project_links')
    .select('id, label, url, sort_order')
    .eq('brief_id', brief.id)
    .order('sort_order', { ascending: true });

  // Load feedback (to know which updates already have responses)
  const { data: feedback } = await supabase
    .from('client_feedback')
    .select('id, update_id')
    .eq('brief_id', brief.id);

  return res.status(200).json({
    brief: portalBrief,
    contract,
    updates: updates || [],
    links: links || [],
    feedback_update_ids: (feedback || []).map(f => f.update_id),
    designer: {
      studio_name: designer.studio_name,
      slug: designer.slug,
      logo_url: designer.logo_url,
      accent_color: designer.accent_color,
      heading_font: designer.heading_font,
      body_font: designer.body_font,
      form_bg_colour: designer.form_bg_colour,
      tagline: designer.tagline,
    },
  });
};
