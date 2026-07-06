const { z } = require('zod');

const create = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

const updateSection = z.object({
  sectionType: z.enum(['timeline', 'contributing_factors', 'corrective_actions', 'preventive_measures']),
  content: z.string().max(20000),
});

const assignReviewer = z.object({
  reviewerId: z.string().uuid(),
});

const submit = z.object({}); // no body needed - transitions draft -> submitted

module.exports = { create, updateSection, assignReviewer, submit };
