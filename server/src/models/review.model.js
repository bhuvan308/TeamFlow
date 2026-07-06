const db = require('../config/db');

const Review = {
  async assignReviewer(rcaId, reviewerId) {
    const { rows } = await db.query(
      `INSERT INTO reviews (rca_id, reviewer_id)
       VALUES ($1, $2)
       ON CONFLICT (rca_id, reviewer_id) DO NOTHING
       RETURNING *`,
      [rcaId, reviewerId]
    );
    return rows[0] || null;
  },

  async removeReviewer(rcaId, reviewerId) {
    await db.query('DELETE FROM reviews WHERE rca_id = $1 AND reviewer_id = $2 AND decision IS NULL', [
      rcaId,
      reviewerId,
    ]);
  },

  async listForRca(rcaId) {
    const { rows } = await db.query(
      `SELECT r.*, u.name AS reviewer_name FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.rca_id = $1 ORDER BY r.created_at ASC`,
      [rcaId]
    );
    return rows;
  },

  async recordDecision(rcaId, reviewerId, decision, comment) {
    const { rows } = await db.query(
      `UPDATE reviews SET decision = $3, comment = $4, decided_at = now()
       WHERE rca_id = $1 AND reviewer_id = $2 RETURNING *`,
      [rcaId, reviewerId, decision, comment]
    );
    return rows[0];
  },

  async allDecided(rcaId) {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS pending FROM reviews WHERE rca_id = $1 AND decision IS NULL`,
      [rcaId]
    );
    return rows[0].pending === 0;
  },

  async anyRejected(rcaId) {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS rejected FROM reviews WHERE rca_id = $1 AND decision = 'rejected'`,
      [rcaId]
    );
    return rows[0].rejected > 0;
  },
};

module.exports = Review;
