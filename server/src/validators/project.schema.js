const { z } = require('zod');

const create = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(2000).optional(),
});

const update = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(2000).optional(),
});

const addMember = z.object({
  userId: z.string().uuid(),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

const setViewPreference = z.object({
  viewPreference: z.enum(['kanban', 'calendar', 'list']),
});

module.exports = { create, update, addMember, setViewPreference };
