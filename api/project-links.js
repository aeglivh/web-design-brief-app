'use strict';

const { applyCors, getUser } = require('./_helpers');
const { z } = require('zod');
const supabase = require('./lib/supabase');

const linkSchema = z.object({
  brief_id: z.string().uuid(),
  label: z.string().min(1).max(200),
  url: z.string().url().max(2000),
});

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const briefId = req.query?.brief_id || req.body?.brief_id;

  // Verify brief belongs to designer
  if (briefId) {
    const { data: brief } = await supabase
      .from('briefs')
      .select('id')
      .eq('id', briefId)
      .eq('designer_id', user.id)
      .single();

    if (!brief) return res.status(404).json({ error: 'Brief not found' });
  }

  // ── GET: list links for a brief ──
  if (req.method === 'GET') {
    if (!briefId) return res.status(400).json({ error: 'brief_id is required' });

    const { data: links, error } = await supabase
      .from('project_links')
      .select('*')
      .eq('brief_id', briefId)
      .order('sort_order', { ascending: true });

    if (error) return res.status(500).json({ error: 'Failed to load links' });
    return res.status(200).json({ links: links || [] });
  }

  // ── POST: create a new link ──
  if (req.method === 'POST') {
    let body;
    try {
      body = linkSchema.parse(req.body);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid request data', details: err.errors });
    }

    // Get next sort_order
    const { data: existing } = await supabase
      .from('project_links')
      .select('sort_order')
      .eq('brief_id', body.brief_id)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

    const { data: link, error: insertErr } = await supabase
      .from('project_links')
      .insert({
        brief_id: body.brief_id,
        designer_id: user.id,
        label: body.label,
        url: body.url,
        sort_order: nextOrder,
      })
      .select('*')
      .single();

    if (insertErr) {
      console.error('[api/project-links]', insertErr.message);
      return res.status(500).json({ error: 'Failed to create link' });
    }

    return res.status(200).json({ success: true, link });
  }

  // ── DELETE: remove a link ──
  if (req.method === 'DELETE') {
    const linkId = req.query?.id || req.body?.id;
    if (!linkId) return res.status(400).json({ error: 'id is required' });

    const { error: delErr } = await supabase
      .from('project_links')
      .delete()
      .eq('id', linkId)
      .eq('designer_id', user.id);

    if (delErr) {
      console.error('[api/project-links]', delErr.message);
      return res.status(500).json({ error: 'Failed to delete link' });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
