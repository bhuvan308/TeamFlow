const { z } = require('zod');

const create = z.object({
  project_id: z.string().uuid(),
  parentTaskId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().date().optional().nullable(),
});

const update = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().date().optional().nullable(),
});

const changeStatus = z.object({
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']),
});

const addRelation = z.object({
  targetTaskId: z.string().uuid(),
});

const listQuery = z.object({
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']).optional(),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = { create, update, changeStatus, addRelation, listQuery };
