'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { applyCors } = require('./_helpers');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { briefText } = req.body || {};
  if (!briefText || typeof briefText !== 'string') {
    return res.status(400).json({ error: 'briefText is required' });
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: `Given this web design brief, extract structured data. Return ONLY valid JSON. No explanation, no markdown, no backticks.

Brief:
${briefText}

Return exactly this shape:
{
  "key_requirements": ["requirement1", "requirement2", "requirement3", "requirement4"],
  "technical_stack": ["tech1", "tech2", "tech3"],
  "content_gaps": ["gap1", "gap2", "gap3"],
  "risk_flags": ["risk1", "risk2"],
  "meeting_questions": ["question1", "question2", "question3"]
}

Rules:
- key_requirements: 4 short action items for the designer. Each starts with a verb. Max 12 words each.
- technical_stack: 3–4 recommended technologies (CMS, frameworks, hosting, tools).
- content_gaps: 3 specific content items the client still needs to provide or produce.
- risk_flags: 2–3 constraints, blockers, or risks the designer should address in the meeting.
- meeting_questions: 3 smart follow-up questions the designer should ask the client in the meeting.`,
      }],
    });

    const text = response.content.map(b => b.text || '').join('').trim();
    const summaryData = JSON.parse(text);
    return res.status(200).json({ summaryData });
  } catch (err) {
    console.error('[api/extract]', err.message);
    return res.status(200).json({ summaryData: null });
  }
};
