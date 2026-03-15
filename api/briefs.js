'use strict';

const { applyCors, getUser } = require('./_helpers');
const { buildClientContractReadyEmail, buildClientUpdateEmail, sendPortalEmail } = require('./_templates/portalEmail');
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
      .select('id, client_name, client_email, business_name, industry, project_type, page_count, budget, brief_text, tags, quote, form_snapshot, created_at, portal_status, brief_visible, quote_visible, contract_visible, portal_paused, deposit_url, deposit_paid, project_phases, signed_at, signed_name')
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
      'client_email',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Dev helper: reset signing fields for re-testing the portal flow
    if (req.body._reset_signing) {
      console.log('[api/briefs] RESET triggered for brief:', id);
      // Reset signing columns separately (they may not exist yet)
      const { error: sErr } = await supabase.from('briefs').update({ signed_name: null, signed_at: null, signed_ip: null }).eq('id', id);
      console.log('[api/briefs] signing reset result:', sErr ? sErr.message : 'OK');
      // Reset contract status back to draft
      const { error: cErr } = await supabase.from('contracts').update({ status: 'draft' }).eq('brief_id', id);
      console.log('[api/briefs] contract reset result:', cErr ? cErr.message : 'OK');
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

    if (uErr) {
      console.error('[api/briefs PUT]', uErr.message, 'updates:', JSON.stringify(updates));
      return res.status(500).json({ error: uErr.message });
    }
    if (!updated) return res.status(404).json({ error: 'Brief not found' });

    // ── Client notifications ──────────────────────────────────────────
    // Notify on every meaningful portal change (skip during dev reset)
    if (!req.body._reset_signing) {
      // Determine what changed and build the notification
      let notifySubject = null;
      let notifyStatusLabel = null;
      let notifyHtmlBuilder = null; // 'update' or 'contract'

      if (updates.contract_visible === true) {
        notifySubject = 'Contract Ready';
        notifyHtmlBuilder = 'contract';
      } else if (updates.brief_visible === true) {
        notifySubject = 'Brief Published';
        notifyStatusLabel = 'Your project brief is now available';
        notifyHtmlBuilder = 'update';
      } else if (updates.quote_visible === true) {
        notifySubject = 'Quote Published';
        notifyStatusLabel = 'Your project quote is now available';
        notifyHtmlBuilder = 'update';
      } else if (updates.portal_status) {
        const statusLabels = {
          intake_complete: 'Intake Complete',
          brief_published: 'Brief Published',
          quote_published: 'Quote Published',
          contract_published: 'Contract Published',
          contract_signed: 'Contract Signed',
          in_progress: 'Project In Progress',
          complete: 'Project Complete',
        };
        notifySubject = 'Portal Update';
        notifyStatusLabel = statusLabels[updates.portal_status] || updates.portal_status;
        notifyHtmlBuilder = 'update';
      }

      if (notifyHtmlBuilder) {
        try {
          const { data: brief } = await supabase
            .from('briefs')
            .select('client_email, client_name, business_name, designer_id')
            .eq('id', id)
            .single();

          if (brief?.client_email) {
            const { data: designer } = await supabase
              .from('designers')
              .select('studio_name, accent_color, slug, designer_email')
              .eq('id', brief.designer_id)
              .single();

            if (designer) {
              const appUrl = process.env.APP_BASE_URL || `https://${process.env.VERCEL_URL || 'localhost:5173'}`;
              const portalUrl = `${appUrl}/studio/${designer.slug}/${id}`;
              const studioName = designer.studio_name || 'Your Designer';

              let html;
              if (notifyHtmlBuilder === 'contract') {
                html = buildClientContractReadyEmail({
                  studioName,
                  accent: designer.accent_color || '#6366f1',
                  clientName: brief.client_name || 'there',
                  projectName: brief.business_name || 'your project',
                  portalUrl,
                });
              } else {
                html = buildClientUpdateEmail({
                  studioName,
                  accent: designer.accent_color || '#6366f1',
                  clientName: brief.client_name || 'there',
                  statusLabel: notifyStatusLabel,
                  note: '',
                  portalUrl,
                });
              }

              await sendPortalEmail({
                to: brief.client_email,
                subject: `${notifySubject} — ${studioName}`,
                html,
                fromName: studioName,
                replyTo: designer.designer_email,
              });
            }
          }
        } catch (emailErr) {
          console.error('[api/briefs] notification email failed:', emailErr.message);
        }
      }
    }

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
