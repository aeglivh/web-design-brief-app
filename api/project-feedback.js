'use strict';

const { applyCors, getUser } = require('./_helpers');
const { projectFeedbackSchema } = require('./_schemas/projectFeedback');
const supabase = require('./lib/supabase');

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: designer fetches feedback for a brief (auth required) ──
  if (req.method === 'GET') {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { brief_id } = req.query || {};
    if (!brief_id) return res.status(400).json({ error: 'brief_id is required' });

    // Verify brief belongs to this designer
    const { data: brief } = await supabase
      .from('briefs')
      .select('id')
      .eq('id', brief_id)
      .eq('designer_id', user.id)
      .single();

    if (!brief) return res.status(404).json({ error: 'Brief not found' });

    const { data: feedback, error } = await supabase
      .from('client_feedback')
      .select('*')
      .eq('brief_id', brief_id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to load feedback' });
    return res.status(200).json({ feedback: feedback || [] });
  }

  // ── POST: client submits feedback (public, no auth) ──
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body;
  try {
    body = projectFeedbackSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid request data', details: err.errors });
  }

  // Verify the brief and update exist
  const { data: update, error: updateErr } = await supabase
    .from('project_updates')
    .select('id, brief_id, feedback_requested')
    .eq('id', body.update_id)
    .eq('brief_id', body.brief_id)
    .single();

  if (updateErr) return res.status(500).json({ error: 'DB error: ' + updateErr.message });
  if (!update) return res.status(404).json({ error: 'Update not found' });
  if (!update.feedback_requested) return res.status(400).json({ error: 'Feedback not requested for this update' });

  // Check if feedback already submitted for this update
  const { data: existing } = await supabase
    .from('client_feedback')
    .select('id')
    .eq('update_id', body.update_id)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: 'Feedback already submitted for this update' });
  }

  const { data: feedback, error: insertErr } = await supabase
    .from('client_feedback')
    .insert({
      brief_id: body.brief_id,
      update_id: body.update_id,
      comment: body.comment,
    })
    .select()
    .single();

  if (insertErr) {
    console.error('[api/project-feedback]', insertErr.message);
    return res.status(500).json({ error: 'Failed to submit feedback: ' + insertErr.message });
  }

  return res.status(200).json({ success: true, feedback });
};
