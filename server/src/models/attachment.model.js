const db = require('../config/db');

const Attachment = {
  async create({ taskId, rcaId, uploadedBy, fileName, storageKey, mimeType, sizeBytes }) {
    const { rows } = await db.query(
      `INSERT INTO attachments (task_id, rca_id, uploaded_by, file_name, storage_key, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [taskId || null, rcaId || null, uploadedBy, fileName, storageKey, mimeType, sizeBytes]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM attachments WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async listForTask(taskId) {
    const { rows } = await db.query(
      'SELECT * FROM attachments WHERE task_id = $1 ORDER BY created_at DESC',
      [taskId]
    );
    return rows;
  },

  async listForRca(rcaId) {
    const { rows } = await db.query(
      'SELECT * FROM attachments WHERE rca_id = $1 ORDER BY created_at DESC',
      [rcaId]
    );
    return rows;
  },

  async delete(id) {
    await db.query('DELETE FROM attachments WHERE id = $1', [id]);
  },
};

module.exports = Attachment;
