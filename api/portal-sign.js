'use strict';

const { applyCors } = require('./_helpers');
const { z } = require('zod');
const { buildDesignerContractSignedEmail, sendPortalEmail } = require('./_templates/portalEmail');
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
    .select('id, signed_at, contract_visible, client_name, business_name, designer_id')
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

  // Notify designer by email
  try {
    const { data: designer } = await supabase
      .from('designers')
      .select('studio_name, accent_color, designer_email')
      .eq('id', brief.designer_id)
      .single();

    console.log("[api/portal-sign] designer email:", designer?.designer_email || "NO EMAIL");
    if (designer?.designer_email) {
      const appUrl = process.env.APP_BASE_URL || `https://${process.env.VERCEL_URL || 'localhost:5173'}`;
      const dashboardUrl = `${appUrl}/login?redirect=${encodeURIComponent('/dashboard?brief=' + body.brief_id)}`;
      const html = buildDesignerContractSignedEmail({
        studioName: designer.studio_name || 'Your Studio',
        accent: designer.accent_color || '#6366f1',
        clientName: body.signed_name,
        businessName: brief.business_name || '',
        signedAt: new Date().toISOString(),
        dashboardUrl,
      });
      await sendPortalEmail({
        to: designer.designer_email,
        subject: `Contract Signed — ${body.signed_name}`,
        html,
      });
    }
  } catch (emailErr) {
    console.error('[api/portal-sign] email failed:', emailErr.message);
  }

  return res.status(200).json({ success: true });
};
