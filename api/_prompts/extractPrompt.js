'use strict';

function buildExtractPrompt(briefText) {
  return `Analyse this web design brief and return ONLY valid JSON (no markdown, no backticks):

${briefText}

Return:
{
  "summaryData": {
    "key_requirements": ["req1", "req2", "req3", "req4"],
    "technical_stack": ["tech1", "tech2", "tech3"],
    "content_gaps": ["gap1", "gap2", "gap3"],
    "risk_flags": ["risk1", "risk2", "risk3"],
    "meeting_questions": ["question1", "question2", "question3"]
  }
}

Rules:
- key_requirements: 4 most critical deliverables or features
- technical_stack: 3-4 recommended technologies
- content_gaps: 3 content items client needs to provide
- risk_flags: 2-3 constraints or risks to discuss
- meeting_questions: 3 questions the designer should ask in the kickoff meeting`;
}

module.exports = { buildExtractPrompt };
