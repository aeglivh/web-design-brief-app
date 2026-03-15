'use strict';

const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(title, accent, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica Neue,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
<tr><td style="background:${esc(accent)};padding:28px 48px">
  <p style="margin:0 0 6px;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#fff;opacity:.75">${esc(title)}</p>
</td></tr>
${bodyHtml}
</table></td></tr></table>
</body></html>`;
}

/**
 * Designer posts a project update → notify client
 */
function buildClientUpdateEmail({ studioName, accent, clientName, statusLabel, note, portalUrl }) {
  const body = `
<tr><td style="padding:32px 48px 0">
  <p style="margin:0 0 4px;font-size:13px;color:#64748b">Hi ${esc(clientName)},</p>
  <p style="margin:12px 0 0;font-size:18px;font-family:Georgia,serif;color:#0f172a;font-weight:600">${esc(statusLabel)}</p>
  ${note ? `<p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#334155">${esc(note)}</p>` : ''}
</td></tr>
<tr><td style="padding:28px 48px 36px;text-align:center">
  <a href="${esc(portalUrl)}" style="display:inline-block;background:${esc(accent)};color:#fff;text-decoration:none;padding:13px 32px;border-radius:4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase">View Portal</a>
</td></tr>
<tr><td style="padding:14px 48px 22px;border-top:1px solid #e2e8f0">
  <p style="margin:0;font-size:11px;color:#94a3b8">${esc(studioName)}</p>
</td></tr>`;

  return wrap(`Project Update — ${studioName}`, accent, body);
}

/**
 * Designer makes contract visible → notify client to review & sign
 */
function buildClientContractReadyEmail({ studioName, accent, clientName, projectName, portalUrl }) {
  const body = `
<tr><td style="padding:32px 48px 0">
  <p style="margin:0 0 4px;font-size:13px;color:#64748b">Hi ${esc(clientName)},</p>
  <p style="margin:12px 0 0;font-size:18px;font-family:Georgia,serif;color:#0f172a">Your contract for <strong>${esc(projectName)}</strong> is ready for review and signing.</p>
  <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#334155">Please review the contract carefully and sign it directly on your project portal.</p>
</td></tr>
<tr><td style="padding:28px 48px 36px;text-align:center">
  <a href="${esc(portalUrl)}" style="display:inline-block;background:${esc(accent)};color:#fff;text-decoration:none;padding:13px 32px;border-radius:4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase">Review &amp; Sign Contract</a>
</td></tr>
<tr><td style="padding:14px 48px 22px;border-top:1px solid #e2e8f0">
  <p style="margin:0;font-size:11px;color:#94a3b8">${esc(studioName)}</p>
</td></tr>`;

  return wrap(`Contract Ready — ${studioName}`, accent, body);
}

/**
 * Client signs the contract → notify designer
 */
function buildDesignerContractSignedEmail({ studioName, accent, clientName, businessName, signedAt, dashboardUrl }) {
  const dateStr = new Date(signedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const body = `
<tr><td style="padding:32px 48px 0">
  <p style="margin:0 0 8px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8">Contract Signed</p>
  <p style="margin:0 0 4px;font-size:20px;font-family:Georgia,serif;color:#0f172a">${esc(clientName)}</p>
  ${businessName ? `<p style="margin:0;font-size:14px;color:#64748b">${esc(businessName)}</p>` : ''}
  <div style="height:1px;background:#e2e8f0;margin:20px 0"></div>
  <p style="margin:0;font-size:14px;color:#334155">Signed on ${esc(dateStr)}</p>
</td></tr>
<tr><td style="padding:28px 48px 36px;text-align:center">
  <a href="${esc(dashboardUrl)}" style="display:inline-block;background:${esc(accent)};color:#fff;text-decoration:none;padding:13px 32px;border-radius:4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase">View in Dashboard</a>
</td></tr>
<tr><td style="padding:14px 48px 22px;border-top:1px solid #e2e8f0">
  <p style="margin:0;font-size:11px;color:#94a3b8">${esc(studioName)} — notification</p>
</td></tr>`;

  return wrap(`Contract Signed — ${clientName}`, accent, body);
}

/**
 * Client submits feedback → notify designer
 */
function buildDesignerFeedbackEmail({ studioName, accent, clientName, businessName, comment, dashboardUrl }) {
  const body = `
<tr><td style="padding:32px 48px 0">
  <p style="margin:0 0 8px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8">New Feedback</p>
  <p style="margin:0 0 4px;font-size:20px;font-family:Georgia,serif;color:#0f172a">${esc(clientName)}</p>
  ${businessName ? `<p style="margin:0;font-size:14px;color:#64748b">${esc(businessName)}</p>` : ''}
  <div style="height:1px;background:#e2e8f0;margin:20px 0"></div>
  <div style="padding:16px;background:#f8fafc;border-radius:6px;border-left:3px solid ${esc(accent)}">
    <p style="margin:0;font-size:14px;line-height:1.7;color:#334155">${esc(comment)}</p>
  </div>
</td></tr>
<tr><td style="padding:28px 48px 36px;text-align:center">
  <a href="${esc(dashboardUrl)}" style="display:inline-block;background:${esc(accent)};color:#fff;text-decoration:none;padding:13px 32px;border-radius:4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase">View in Dashboard</a>
</td></tr>
<tr><td style="padding:14px 48px 22px;border-top:1px solid #e2e8f0">
  <p style="margin:0;font-size:11px;color:#94a3b8">${esc(studioName)} — notification</p>
</td></tr>`;

  return wrap(`Feedback from ${clientName}`, accent, body);
}

/**
 * Send a portal notification email via Resend
 */
async function sendPortalEmail({ to, subject, html, fromName, replyTo }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[sendPortalEmail] SKIPPED — no RESEND_API_KEY');
    return { sent: false, reason: 'email_disabled' };
  }

  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const from = fromName
    ? `${fromName} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@mail.debrieft.app'}>`
    : process.env.EMAIL_FROM || 'debrieft <noreply@mail.debrieft.app>';

  const opts = { from, to, subject, html };
  if (replyTo) opts.reply_to = replyTo;

  console.log('[sendPortalEmail] Sending:', { from, to, subject });
  const { data, error } = await resend.emails.send(opts);
  if (error) throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`);
  console.log('[sendPortalEmail] Sent OK, id:', data?.id);
  return { sent: true };
}

module.exports = {
  buildClientUpdateEmail,
  buildClientContractReadyEmail,
  buildDesignerContractSignedEmail,
  buildDesignerFeedbackEmail,
  sendPortalEmail,
};
