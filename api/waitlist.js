'use strict';

const { applyCors } = require('./_internal/cors');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Waitlist closes after 7 days: March 20, 2026 23:59:59 UTC
const WAITLIST_CLOSES = new Date('2026-03-20T23:59:59Z');

module.exports = async function handler(req, res) {
  try {
    applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    if (req.method === 'GET') {
      const now = new Date();
      const open = now <= WAITLIST_CLOSES;
      const remaining = Math.max(0, WAITLIST_CLOSES - now);
      const { count, error: countErr } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
      if (countErr) {
        console.error('Waitlist count error:', countErr);
        return res.json({ open, closes: WAITLIST_CLOSES.toISOString(), count: 0, remaining });
      }
      return res.json({ open, closes: WAITLIST_CLOSES.toISOString(), count: count || 0, remaining });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const now = new Date();
    if (now > WAITLIST_CLOSES) {
      return res.status(410).json({ error: 'The waitlist is now closed.' });
    }

    const { email, name, referral } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.trim().toLowerCase(), name: name?.trim() || null, referral: referral?.trim() || null });

    if (error) {
      console.error('Waitlist insert error:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: "You're already on the list!" });
      }
      return res.status(500).json({ error: 'Something went wrong. Try again.' });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Waitlist handler error:', err);
    return res.status(500).json({ error: 'Server error. Try again.' });
  }
};
