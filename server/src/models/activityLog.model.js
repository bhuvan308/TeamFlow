const db = require('../config/db');

const ActivityLog = {
  async record({ entityType, entityId, actorId, action, metadata = {} }) {
    const { rows } = await db.query(
      `INSERT INTO activity_logs (entity_type, entity_id, actor_id, action, metadata)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [entityType, entityId, actorId || null, action, metadata]
    );
    return rows[0];
  },

  async listForEntity(entityType, entityId, { limit = 50 } = {}) {
    const { rows } = await db.query(
      `SELECT al.*, u.name AS actor_name FROM activity_logs al
       LEFT JOIN users u ON u.id = al.actor_id
       WHERE al.entity_type = $1 AND al.entity_id = $2
       ORDER BY al.created_at DESC LIMIT $3`,
      [entityType, entityId, limit]
    );
    return rows;
  },
};

module.exports = ActivityLog;
