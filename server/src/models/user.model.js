const db = require('../config/db');

const User = {
  async create({ name, email, passwordHash }) {
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, theme, email_opt_out, created_at`,
      [name, email, passwordHash]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id, name, email, theme, email_opt_out, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async updatePreferences(id, { theme, emailOptOut }) {
    const { rows } = await db.query(
      `UPDATE users SET
         theme = COALESCE($2, theme),
         email_opt_out = COALESCE($3, email_opt_out),
         updated_at = now()
       WHERE id = $1
       RETURNING id, name, email, theme, email_opt_out`,
      [id, theme ?? null, emailOptOut ?? null]
    );
    return rows[0];
  },
};

module.exports = User;
