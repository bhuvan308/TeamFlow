const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const User = require('../models/user.model');
const { ApiError } = require('../middleware/errorHandler');
const { sendEmail } = require('../services/email.service');

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
}

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, 'Invalid input', parsed.error.flatten());
  }

  const existing = await User.findByEmail(parsed.data.email);

  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await User.create({
    ...parsed.data,
    passwordHash,
  });

  const token = signToken(user);

  // Send Welcome Email
  try {
    await sendEmail({
      userId: user.id,
      subject: '🎉 Welcome to TeamFlow',
      text: `Hello ${user.name},

Welcome to TeamFlow!

Your account has been created successfully.

You can now log in and start managing your projects.

Thank you,
TeamFlow Team`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#2563eb;">
            Welcome to TeamFlow 🎉
          </h2>

          <p>Hello <strong>${user.name}</strong>,</p>

          <p>
            Your account has been created successfully.
          </p>

          <p>
            You can now log in and start managing your projects,
            tasks and collaborations.
          </p>

          <hr>

          <p>
            Thanks,<br>
            <strong>TeamFlow Team</strong>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send welcome email:', err.message);
  }

  delete user.password_hash;

  res.status(201).json({
    message: 'Registration successful',
    user,
    token,
  });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, 'Invalid input', parsed.error.flatten());
  }

  const user = await User.findByEmail(parsed.data.email);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(
    parsed.data.password,
    user.password_hash
  );

  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user);

  delete user.password_hash;

  res.json({
    user,
    token,
  });
}

async function me(req, res) {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  delete user.password_hash;

  res.json({
    user,
  });
}

async function updatePreferences(req, res) {
  const schema = z.object({
    theme: z.enum(['light', 'dark']).optional(),
    emailOptOut: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, 'Invalid input', parsed.error.flatten());
  }

  const user = await User.updatePreferences(
    req.user.id,
    parsed.data
  );

  res.json({
    user,
  });
}

module.exports = {
  register,
  login,
  me,
  updatePreferences,
};











// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { z } = require('zod');
// const User = require('../models/user.model');
// const { ApiError } = require('../middleware/errorHandler');

// const registerSchema = z.object({
//   name: z.string().min(1).max(120),
//   email: z.string().email(),
//   password: z.string().min(8),
// });

// const loginSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(1),
// });

// function signToken(user) {
//   return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN || '7d',
//   });
// }

// async function register(req, res) {
//   const parsed = registerSchema.safeParse(req.body);
//   if (!parsed.success) throw new ApiError(400, 'Invalid input', parsed.error.flatten());

//   const existing = await User.findByEmail(parsed.data.email);
//   if (existing) throw new ApiError(409, 'Email already registered');

//   const passwordHash = await bcrypt.hash(parsed.data.password, 10);
//   const user = await User.create({ ...parsed.data, passwordHash });
//   const token = signToken(user);
//   res.status(201).json({ user, token });
// }

// async function login(req, res) {
//   const parsed = loginSchema.safeParse(req.body);
//   if (!parsed.success) throw new ApiError(400, 'Invalid input', parsed.error.flatten());

//   const user = await User.findByEmail(parsed.data.email);
//   if (!user) throw new ApiError(401, 'Invalid email or password');

//   const valid = await bcrypt.compare(parsed.data.password, user.password_hash);
//   if (!valid) throw new ApiError(401, 'Invalid email or password');

//   const token = signToken(user);
//   delete user.password_hash;
//   res.json({ user, token });
// }

// async function me(req, res) {
//   const user = await User.findById(req.user.id);
//   if (!user) throw new ApiError(404, 'User not found');
//   res.json({ user });
// }

// async function updatePreferences(req, res) {
//   const schema = z.object({
//     theme: z.enum(['light', 'dark']).optional(),
//     emailOptOut: z.boolean().optional(),
//   });
//   const parsed = schema.safeParse(req.body);
//   if (!parsed.success) throw new ApiError(400, 'Invalid input', parsed.error.flatten());

//   const user = await User.updatePreferences(req.user.id, parsed.data);
//   res.json({ user });
// }

// module.exports = { register, login, me, updatePreferences };
