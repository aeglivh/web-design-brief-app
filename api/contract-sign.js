'use strict';

const { applyCors, getUser } = require('./_helpers');
const { buildClientContractReadyEmail, sendPortalEmail } = require('./_templates/portalEmail');
const supabase = require('./lib/supabase');

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { contractId, signed_name } = req.body || {};
  if (!contractId || !signed_name?.trim()) {
    return res.status(400).json({ error: 'contractId and signed_name are required' });
  }

  const { data: contract, error: err } = await supabase
    .from('contracts')
    .update({
      designer_signed_name: signed_name.trim(),
      designer_signed_at: new Date().toISOString(),
      status: 'designer_signed',
    })
    .eq('id', contractId)
    .eq('designer_id', user.id)
    .select('id, brief_id, contract_data, status, created_at, designer_signed_name, designer_signed_at')
    .single();

  if (err || !contract) {
    console.error('[api/contract-sign]', err?.message);
    return res.status(404).json({ error: 'Contract not found' });
  }

  // Notify the client that the designer has signed
  if (contract.brief_id) {
    try {
      const { data: brief } = await supabase
        .from('briefs')
        .select('client_email, client_name, business_name, designer_id')
        .eq('id', contract.brief_id)
        .single();

      if (brief?.client_email) {
        const { data: designer } = await supabase
          .from('designers')
          .select('studio_name, accent_color, slug, designer_email')
          .eq('id', brief.designer_id)
          .single();

        if (designer) {
          const appUrl = process.env.APP_BASE_URL || `https://${process.env.VERCEL_URL || 'localhost:5173'}`;
          const portalUrl = `${appUrl}/studio/${designer.slug}/${contract.brief_id}`;
          const html = buildClientContractReadyEmail({
            studioName: designer.studio_name || 'Your Designer',
            accent: designer.accent_color || '#6366f1',
            clientName: brief.client_name || 'there',
            projectName: brief.business_name || 'your project',
            portalUrl,
          });
          await sendPortalEmail({
            to: brief.client_email,
            subject: `Contract Signed — ${designer.studio_name || 'Your Designer'}`,
            html,
            fromName: designer.studio_name,
            replyTo: designer.designer_email,
          });
        }
      }
    } catch (emailErr) {
      console.error('[api/contract-sign] email failed:', emailErr.message);
    }
  }

  return res.status(200).json({ success: true, contract });
};
