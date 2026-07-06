const { z } = require('zod');

const decide = z.object({
  decision: z.enum(['approved', 'rejected']),
  comment: z.string().min(1, 'A comment is required when recording a decision').max(5000),
});

module.exports = { decide };
