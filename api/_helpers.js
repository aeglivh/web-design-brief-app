'use strict';

// Backward-compatible barrel that re-exports from new module structure.
// Existing API endpoints can still `require('./_helpers')` without changes.
// New endpoints should import from specific modules directly.

const { applyCors } = require('./_internal/cors');
const { getUser } = require('./_internal/auth');
const { generateSchema } = require('./_schemas/generate');
const { emailSchema } = require('./_schemas/email');
const { ratesSchema } = require('./_schemas/rates');
const { buildBriefPrompt } = require('./_prompts/briefPrompt');
const { buildQuotePrompt } = require('./_prompts/quotePrompt');
const { buildContractPrompt } = require('./_prompts/contractPrompt');
const { buildEmailHtml, buildDesignerNotificationEmail, sendEmail } = require('./_templates/briefEmail');

module.exports = {
  applyCors,
  getUser,
  generateSchema,
  emailSchema,
  ratesSchema,
  buildBriefPrompt,
  buildQuotePrompt,
  buildContractPrompt,
  buildEmailHtml,
  buildDesignerNotificationEmail,
  sendEmail,
};
