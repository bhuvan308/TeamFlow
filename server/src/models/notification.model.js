const db = require('../config/db');

const Notification = {
  // Returns null if this (user, dedupe_key, channel) already exists - the
  // caller treats null as "suppressed as duplicate".
  async createIfNotDuplicate({ userId, eventType, dedupeKey, payload, channel }) {
    const { rows } = await db.query(
      `INSERT INTO notifications (user_id, event_type, dedupe_key, payload, channel)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, dedupe_key, channel) DO NOTHING
       RETURNING *`,
      [userId, eventType, dedupeKey, payload, channel]
    );
    return rows[0] || null;
  },

  async markSent(id) {
    const { rows } = await db.query(
      `UPDATE notifications SET status = 'sent', sent_at = now() WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  },

  async markFailed(id) {
    const { rows } = await db.query(
      `UPDATE notifications SET status = 'failed' WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  },

  async listForUser(userId, { unreadOnly = false, limit = 25, offset = 0 } = {}) {
    const clause = unreadOnly ? 'AND read_at IS NULL' : '';
    const { rows } = await db.query(
      `SELECT * FROM notifications
       WHERE user_id = $1 AND channel = 'in_app' ${clause}
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  },

  async markRead(id, userId) {
    const { rows } = await db.query(
      `UPDATE notifications SET read_at = now()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return rows[0];
  },

  async markAllRead(userId) {
    await db.query(
      `UPDATE notifications SET read_at = now()
       WHERE user_id = $1 AND channel = 'in_app' AND read_at IS NULL`,
      [userId]
    );
  },
};

module.exports = Notification;
