'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { applyCors, getUser, buildContractPrompt } = require('./_helpers');
const supabase  = require('./lib/supabase');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // ── GET: load existing contract for a brief ───────────────
  if (req.method === 'GET') {
    const { briefId } = req.query || {};
    if (!briefId) return res.status(400).json({ error: 'briefId is required' });

    const { data: contract, error: err } = await supabase
      .from('contracts')
      .select('id, contract_data, status, created_at, designer_signed_name, designer_signed_at')
      .eq('brief_id', briefId)
      .eq('designer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (err) return res.status(500).json({ error: 'Failed to load contract' });
    return res.status(200).json({ contract: contract || null });
  }

  // ── PATCH: update contract data ───────────────────────────
  if (req.method === 'PATCH') {
    const { contractId, contract_data } = req.body || {};
    if (!contractId || !contract_data) {
      return res.status(400).json({ error: 'contractId and contract_data are required' });
    }

    const { data: contract, error: err } = await supabase
      .from('contracts')
      .update({ contract_data, updated_at: new Date().toISOString() })
      .eq('id', contractId)
      .eq('designer_id', user.id)
      .select('id, contract_data, status, created_at, designer_signed_name, designer_signed_at')
      .single();

    if (err || !contract) return res.status(404).json({ error: 'Contract not found' });
    return res.status(200).json({ success: true, contract });
  }

  // ── POST: generate new contract ───────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { briefId } = req.body || {};
  if (!briefId) return res.status(400).json({ error: 'briefId is required' });

  // Check if contract already exists for this brief
  const { data: existing } = await supabase
    .from('contracts')
    .select('id, contract_data, status, created_at, designer_signed_name, designer_signed_at')
    .eq('brief_id', briefId)
    .eq('designer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return res.status(200).json({ success: true, contract: existing });
  }

  // Load the brief with form snapshot and quote
  const { data: brief, error: briefErr } = await supabase
    .from('briefs')
    .select('form_snapshot, quote')
    .eq('id', briefId)
    .eq('designer_id', user.id)
    .single();
  if (briefErr || !brief) return res.status(404).json({ error: 'Brief not found' });

  // Contract requires a quote first
  if (!brief.quote) return res.status(400).json({ error: 'A quote must be generated before creating a contract' });

  // Load designer profile (studio_name needed for the prompt)
  const { data: designer, error: designerErr } = await supabase
    .from('designers')
    .select('*')
    .eq('id', user.id)
    .single();
  if (designerErr || !designer) return res.status(400).json({ error: 'Designer profile not found' });

  try {
    const prompt = buildContractPrompt(brief.form_snapshot, brief.quote, designer);
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages:   [{ role: 'user', content: prompt }],
    });

    const text = response.content.map(b => b.text || '').join('').trim();
    let contract_data;
    try {
      contract_data = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contract_data = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse contract JSON');
      }
    }

    // Save the contract
    const { data: contract, error: contractErr } = await supabase
      .from('contracts')
      .insert({
        brief_id:      briefId,
        designer_id:   user.id,
        contract_data,
        status:        'draft',
      })
      .select('id, contract_data, status, created_at, designer_signed_name, designer_signed_at')
      .single();
    if (contractErr) throw contractErr;

    // Update brief status to contracted
    await supabase
      .from('briefs')
      .update({ status: 'contracted' })
      .eq('id', briefId)
      .eq('designer_id', user.id);

    return res.status(200).json({ success: true, contract });
  } catch (err) {
    console.error('[api/contract]', err.message);
    return res.status(502).json({ error: 'Failed to generate contract. Please try again.' });
  }
};
