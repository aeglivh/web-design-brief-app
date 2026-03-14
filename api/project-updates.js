'use strict';

const { applyCors, getUser } = require('./_helpers');
const { projectUpdateSchema } = require('./_schemas/projectUpdate');
const supabase = require('./lib/supabase');

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // ── GET: list updates for a brief ──────────────────────────
  if (req.method === 'GET') {
    const { brief_id } = req.query || {};
    if (!brief_id) return res.status(400).json({ error: 'brief_id is required' });

    // Verify the brief belongs to this designer
    const { data: brief } = await supabase
      .from('briefs')
      .select('id')
      .eq('id', brief_id)
      .eq('designer_id', user.id)
      .single();

    if (!brief) return res.status(404).json({ error: 'Brief not found' });

    const { data: updates, error } = await supabase
      .from('project_updates')
      .select('*')
      .eq('brief_id', brief_id)
      .eq('designer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to load updates' });
    return res.status(200).json({ updates: updates || [] });
  }

  // ── POST: create a new update ──────────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body;
  try {
    body = projectUpdateSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid request data', details: err.errors });
  }

  // Verify the brief belongs to this designer
  const { data: brief } = await supabase
    .from('briefs')
    .select('id')
    .eq('id', body.brief_id)
    .eq('designer_id', user.id)
    .single();

  if (!brief) return res.status(404).json({ error: 'Brief not found' });

  const { data: update, error: insertErr } = await supabase
    .from('project_updates')
    .insert({
      brief_id: body.brief_id,
      designer_id: user.id,
      status_label: body.status_label,
      note: body.note || null,
      link_url: body.link_url || null,
      link_label: body.link_label || null,
      feedback_requested: body.feedback_requested,
    })
    .select('*')
    .single();

  if (insertErr) {
    console.error('[api/project-updates]', insertErr.message);
    return res.status(500).json({ error: 'Failed to create update' });
  }

  return res.status(200).json({ success: true, update });
};
