const db = require('../config/db');

const RCA = {
  async create({ projectId, title, severity, createdBy }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO rcas (project_id, title, severity, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [projectId, title, severity, createdBy]
      );
      const rca = rows[0];
      const sectionTypes = ['timeline', 'contributing_factors', 'corrective_actions', 'preventive_measures'];
      for (const sectionType of sectionTypes) {
        await client.query(
          `INSERT INTO rca_sections (rca_id, section_type, content) VALUES ($1, $2, '')`,
          [rca.id, sectionType]
        );
      }
      await client.query('COMMIT');
      return rca;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM rcas WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async listByProject(projectId) {
    const { rows } = await db.query(
      'SELECT * FROM rcas WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return rows;
  },

  async updateStatus(id, status) {
    const { rows } = await db.query(
      `UPDATE rcas SET status = $2, updated_at = now(), closed_at = ${status === 'closed' ? 'now()' : 'closed_at'}
       WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return rows[0];
  },
};

module.exports = RCA;
