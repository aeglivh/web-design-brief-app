'use strict';

// Backward-compatible barrel that re-exports from new module structure.
// Existing API endpoints can still `require('./_helpers')` without changes.
// New endpoints should import from specific modules directly.

const { applyCors } = require('./helpers/cors');
const { getUser } = require('./helpers/auth');
const { generateSchema } = require('./schemas/generate');
const { emailSchema } = require('./schemas/email');
const { ratesSchema } = require('./schemas/rates');
const { buildBriefPrompt } = require('./prompts/briefPrompt');
const { buildQuotePrompt } = require('./prompts/quotePrompt');
const { buildContractPrompt } = require('./prompts/contractPrompt');
const { buildEmailHtml, buildDesignerNotificationEmail, sendEmail } = require('./templates/briefEmail');

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
