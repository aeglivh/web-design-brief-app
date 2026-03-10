'use strict';

const { applyCors, getUser, ratesSchema } = require('./_helpers');
const supabase = require('./lib/supabase');

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // ── GET — load rates ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('rates')
      .select('*')
      .eq('designer_id', user.id)
      .single();
    if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
    return res.status(200).json(data || null);
  }

  // ── PUT — upsert rates ───────────────────────────────────────────────────
  if (req.method === 'PUT') {
    let parsed;
    try {
      parsed = ratesSchema.parse(req.body);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid rates data', details: err.errors });
    }

    const { data, error } = await supabase
      .from('rates')
      .upsert({
        designer_id:  user.id,
        page_rates:   parsed.page_rates,
        addon_rates:  parsed.addon_rates,
        hourly_rate:  parsed.hourly_rate,
        multipliers:  parsed.multipliers,
        currency:     parsed.currency,
        updated_at:   new Date().toISOString(),
      }, { onConflict: 'designer_id' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
