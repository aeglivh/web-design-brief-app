'use strict';

const { z } = require('zod');

const projectUpdateSchema = z.object({
  brief_id: z.string().uuid(),
  status_label: z.string().min(1).max(200),
  note: z.string().max(2000).optional(),
  link_url: z.string().url().max(500).optional(),
  link_label: z.string().max(200).optional(),
  feedback_requested: z.boolean().default(false),
});

module.exports = { projectUpdateSchema };
