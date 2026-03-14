'use strict';

const { applyCors, getUser } = require('./_helpers');
const supabase = require('./lib/supabase');

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // ── GET — list all briefs ──────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('briefs')
      .select('id, client_name, client_email, business_name, industry, project_type, page_count, budget, brief_text, tags, quote, form_snapshot, created_at, portal_status, brief_visible, quote_visible, contract_visible, portal_paused, deposit_url, deposit_paid, project_phases')
      .eq('designer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ── PUT — update brief fields (portal controls) ──────────────────────────
  if (req.method === 'PUT') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required' });

    const allowed = [
      'portal_status', 'brief_visible', 'quote_visible', 'contract_visible',
      'portal_paused', 'deposit_url', 'deposit_paid', 'completion_message', 'project_phases',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data: updated, error: uErr } = await supabase
      .from('briefs')
      .update(updates)
      .eq('id', id)
      .eq('designer_id', user.id)
      .select('id, portal_status, brief_visible, quote_visible, contract_visible, portal_paused, deposit_url, deposit_paid, project_phases')
      .single();

    if (uErr) return res.status(500).json({ error: uErr.message });
    if (!updated) return res.status(404).json({ error: 'Brief not found' });
    return res.status(200).json(updated);
  }

  // ── DELETE — delete a brief ───────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id is required' });

    const { error } = await supabase
      .from('briefs')
      .delete()
      .eq('id', id)
      .eq('designer_id', user.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
