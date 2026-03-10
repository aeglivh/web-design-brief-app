'use strict';

const { applyCors, emailSchema, sendEmail } = require('./_helpers');

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let data;
  try {
    data = emailSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid email data', details: err.errors });
  }

  try {
    const result = await sendEmail(data);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[api/send-email]', err.message);
    return res.status(502).json({ error: 'Failed to send email.' });
  }
};
