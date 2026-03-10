'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { applyCors, getUser, buildQuotePrompt } = require('./_helpers');
const supabase  = require('./lib/supabase');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { briefId } = req.body || {};
  if (!briefId) return res.status(400).json({ error: 'briefId is required' });

  // Load the brief's form snapshot
  const { data: brief, error: briefErr } = await supabase
    .from('briefs')
    .select('form_snapshot')
    .eq('id', briefId)
    .eq('designer_id', user.id)
    .single();
  if (briefErr || !brief) return res.status(404).json({ error: 'Brief not found' });

  // Load designer's rates
  const { data: rates, error: ratesErr } = await supabase
    .from('rates')
    .select('*')
    .eq('designer_id', user.id)
    .single();
  if (ratesErr || !rates) return res.status(400).json({ error: 'Please configure your rates first' });

  try {
    const prompt = buildQuotePrompt(brief.form_snapshot, rates);
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages:   [{ role: 'user', content: prompt }],
    });

    const text = response.content.map(b => b.text || '').join('').trim();
    let quote;
    try {
      quote = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quote = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse quote JSON');
      }
    }

    // Save quote to the brief
    await supabase
      .from('briefs')
      .update({ quote })
      .eq('id', briefId)
      .eq('designer_id', user.id);

    return res.status(200).json({ success: true, quote });
  } catch (err) {
    console.error('[api/quote]', err.message);
    return res.status(502).json({ error: 'Failed to generate quote. Please try again.' });
  }
};
