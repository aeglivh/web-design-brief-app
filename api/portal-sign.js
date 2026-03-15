'use strict';

const { applyCors } = require('./_helpers');
const { z } = require('zod');
const supabase = require('./lib/supabase');

const signSchema = z.object({
  brief_id: z.string().uuid(),
  signed_name: z.string().min(1).max(200),
});

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body;
  try {
    body = signSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid request data', details: err.errors });
  }

  // Verify brief exists and contract is visible
  const { data: brief, error: bErr } = await supabase
    .from('briefs')
    .select('id, signed_at, contract_visible')
    .eq('id', body.brief_id)
    .single();

  if (bErr || !brief) return res.status(404).json({ error: 'Brief not found' });
  if (!brief.contract_visible) return res.status(400).json({ error: 'Contract not available for signing' });
  if (brief.signed_at) return res.status(409).json({ error: 'Contract already signed' });

  // Capture client IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || null;

  // Update brief with signature
  const { error: uErr } = await supabase
    .from('briefs')
    .update({
      signed_name: body.signed_name,
      signed_at: new Date().toISOString(),
      signed_ip: ip,
      portal_status: 'contract_signed',
    })
    .eq('id', body.brief_id);

  if (uErr) {
    console.error('[api/portal-sign]', uErr.message);
    return res.status(500).json({ error: 'Failed to save signature' });
  }

  // Update contract status to signed
  await supabase
    .from('contracts')
    .update({ status: 'signed' })
    .eq('brief_id', body.brief_id);

  return res.status(200).json({ success: true });
};
