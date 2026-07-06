const { z } = require('zod');

const register = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8),
});

const login = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updatePreferences = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  emailOptOut: z.boolean().optional(),
});

module.exports = { register, login, updatePreferences };
