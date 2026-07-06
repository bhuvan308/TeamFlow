const db = require('../config/db');

const RCASection = {
  async listForRca(rcaId) {
    const { rows } = await db.query(
      'SELECT * FROM rca_sections WHERE rca_id = $1 ORDER BY section_type',
      [rcaId]
    );
    return rows;
  },

  async update(rcaId, sectionType, content) {
    const { rows } = await db.query(
      `UPDATE rca_sections SET content = $3, updated_at = now()
       WHERE rca_id = $1 AND section_type = $2 RETURNING *`,
      [rcaId, sectionType, content]
    );
    return rows[0];
  },

  // A submitted RCA must have non-empty content in every section.
  async allSectionsComplete(rcaId) {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS incomplete FROM rca_sections
       WHERE rca_id = $1 AND btrim(content) = ''`,
      [rcaId]
    );
    return rows[0].incomplete === 0;
  },
};

module.exports = RCASection;
