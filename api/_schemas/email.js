'use strict';

const { z } = require('zod');

const s = (max = 500) => z.string().max(max).transform(v => v.trim());

const emailSchema = z.object({
  clientEmail:   z.string().email().max(254),
  designerEmail: z.string().email().max(254).optional().nullable(),
  clientName:    s(120),
  studioName:    s(120),
  briefText:     s(15_000),
  businessName:  s(200),
  budget:        s(80),
});

module.exports = { emailSchema };
