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
      .select('id, client_name, client_email, business_name, industry, project_type, page_count, budget, brief_text, tags, quote, form_snapshot, created_at')
      .eq('designer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
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
