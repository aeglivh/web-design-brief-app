'use strict';

const { applyCors, getUser } = require('./_helpers');
const supabase = require('./lib/supabase');

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET ──────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { slug } = req.query;

    // Public: GET /api/designer?slug=xxx
    if (slug) {
      const { data, error } = await supabase
        .from('designers')
        .select('studio_name, tagline, accent_color, logo_url, designer_email, bg_color, form_bg_colour, heading_font, body_font')
        .eq('slug', slug)
        .single();
      if (error || !data) return res.status(404).json({ error: 'Studio not found' });
      return res.status(200).json(data);
    }

    // Authenticated: own profile
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('designers')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
    return res.status(200).json(data || null);
  }

  // ── POST — create designer (onboarding) ──────────────────────────────────
  if (req.method === 'POST') {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { studio_name, slug } = req.body || {};
    if (!studio_name || !slug) return res.status(400).json({ error: 'studio_name and slug are required' });
    if (!/^[a-z0-9-]{2,60}$/.test(slug)) {
      return res.status(400).json({ error: 'slug must be 2–60 lowercase letters, digits, or hyphens' });
    }

    const { data, error } = await supabase
      .from('designers')
      .insert({ id: user.id, studio_name, slug })
      .select()
      .single();
    if (error) {
      const msg = error.code === '23505' ? 'That slug is already taken.' : error.message;
      return res.status(409).json({ error: msg });
    }
    return res.status(201).json(data);
  }

  // ── PUT — update own profile ──────────────────────────────────────────────
  if (req.method === 'PUT') {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const allowed = ['studio_name', 'tagline', 'slug', 'accent_color', 'logo_url', 'designer_email', 'bg_color', 'form_bg_colour', 'dashboard_bg_colour', 'dashboard_bar_colour', 'heading_font', 'body_font'];
    const updates = {};
    for (const k of allowed) {
      if (req.body && req.body[k] !== undefined) updates[k] = req.body[k];
    }
    if (updates.slug && !/^[a-z0-9-]{2,60}$/.test(updates.slug)) {
      return res.status(400).json({ error: 'slug must be 2–60 lowercase letters, digits, or hyphens' });
    }

    const { data, error } = await supabase
      .from('designers')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) {
      const msg = error.code === '23505' ? 'That slug is already taken.' : error.message;
      return res.status(409).json({ error: msg });
    }
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
