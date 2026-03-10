'use strict';

const crypto    = require('crypto');
const Anthropic = require('@anthropic-ai/sdk');
const { applyCors, generateSchema, buildBriefPrompt, buildDesignerNotificationEmail } = require('./_helpers');
const supabase  = require('./lib/supabase');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Upload a base64 file to Supabase Storage, return public URL or null
async function uploadFile(base64, mediaType, path) {
  try {
    const ext = mediaType.includes('png') ? 'png' : mediaType.includes('svg') ? 'svg' : mediaType.includes('pdf') ? 'pdf' : 'jpg';
    const { error } = await supabase.storage
      .from('brief-uploads')
      .upload(`${path}.${ext}`, Buffer.from(base64, 'base64'), { contentType: mediaType, upsert: false });
    if (error) { console.error('[storage]', error.message); return null; }
    const { data } = supabase.storage.from('brief-uploads').getPublicUrl(`${path}.${ext}`);
    return data?.publicUrl || null;
  } catch (err) {
    console.error('[storage] upload failed:', err.message);
    return null;
  }
}

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let data;
  try {
    data = generateSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid request data', details: err.errors });
  }

  // Build message content: uploaded images + prompt text
  const content = [];
  (data.uploads || []).forEach(u => {
    if (u.mediaType.startsWith('image/')) {
      content.push({ type: 'image', source: { type: 'base64', media_type: u.mediaType, data: u.base64 } });
    }
  });
  content.push({ type: 'text', text: buildBriefPrompt(data) });

  try {
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages:   [{ role: 'user', content }],
    });

    let full = response.content.map(b => b.text || '').join('').trim();
    if (!full) throw new Error('AI returned an empty response');

    // Extract tags JSON block
    let tags = null;
    const tagsMatch = full.match(/\[TAGS\]([\s\S]*?)\[\/TAGS\]/);
    if (tagsMatch) {
      try { tags = JSON.parse(tagsMatch[1].trim()); } catch {}
      full = full.replace(/\[TAGS\][\s\S]*?\[\/TAGS\]/, '').trim();
    }

    // Save brief to DB if a designerSlug was provided
    if (data.designerSlug) {
      try {
        const { data: designer } = await supabase
          .from('designers')
          .select('id, designer_email, studio_name, accent_color')
          .eq('slug', data.designerSlug)
          .single();

        if (designer) {
          const briefId = crypto.randomUUID();

          // Upload files to storage (best-effort)
          const uploadUrls = await Promise.all(
            (data.uploads || []).map((u, i) =>
              uploadFile(u.base64, u.mediaType, `${briefId}/upload_${i}`)
            )
          );

          // Compact snapshot — no base64
          const snap = { ...data };
          delete snap.uploads;
          snap.uploadUrls = (data.uploads || []).map((u, i) => ({
            url:   uploadUrls[i] || null,
            label: u.label || '',
          }));

          await supabase.from('briefs').insert({
            id:            briefId,
            designer_id:   designer.id,
            client_name:   data.contactName || '',
            client_email:  data.contactEmail || '',
            business_name: data.businessName || '',
            industry:      data.industry || '',
            project_type:  data.projectType || '',
            page_count:    data.pageCount || '',
            budget:        data.budgetRange || '',
            brief_text:    full,
            tags,
            form_snapshot: snap,
          });

          // Send designer notification email
          if (designer.designer_email && process.env.RESEND_API_KEY) {
            try {
              const { Resend } = require('resend');
              const resend = new Resend(process.env.RESEND_API_KEY);
              const appUrl = process.env.APP_BASE_URL || `https://${process.env.VERCEL_URL || 'localhost:5173'}`;
              const destination = `/dashboard?brief=${briefId}`;
              const briefUrl = `${appUrl}/login?redirect=${encodeURIComponent(destination)}`;
              const html = buildDesignerNotificationEmail({
                studioName:  designer.studio_name || 'Web Design Brief Studio',
                acc:         designer.accent_color || '#3b82f6',
                clientName:  data.contactName || 'Unknown client',
                clientEmail: data.contactEmail || '',
                businessName: data.businessName || '',
                industry:    data.industry || '',
                budget:      data.budgetRange || '',
                pageCount:   data.pageCount || '',
                briefUrl,
              });
              await resend.emails.send({
                from:    process.env.EMAIL_FROM || 'briefs@webdesignbrief.studio',
                to:      designer.designer_email,
                subject: `New brief — ${data.businessName || data.contactName}`,
                html,
              });
            } catch (emailErr) {
              console.error('[api/generate] notification email failed:', emailErr.message);
            }
          }
        }
      } catch (dbErr) {
        console.error('[api/generate] DB save failed:', dbErr.message);
      }
    }

    return res.status(200).json({ success: true, brief: full, tags });
  } catch (err) {
    console.error('[api/generate]', err.message);
    return res.status(502).json({ error: 'Failed to generate brief. Please try again.' });
  }
};
