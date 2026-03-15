'use strict';

const { z } = require('zod');

const projectFeedbackSchema = z.object({
  brief_id: z.string().uuid(),
  update_id: z.string().uuid(),
  comment: z.string().min(1).max(2000),
});

module.exports = { projectFeedbackSchema };
