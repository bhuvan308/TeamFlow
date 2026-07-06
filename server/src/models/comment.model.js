const db = require('../config/db');

const MENTION_RE = /@\[([^\]]+)\]\(([0-9a-fA-F-]{36})\)/g; // @[Name](uuid) syntax from the editor

function extractMentionedIds(body) {
  const ids = [];
  let match;
  while ((match = MENTION_RE.exec(body)) !== null) {
    ids.push(match[2]);
  }
  return [...new Set(ids)];
}

const Comment = {
  async create({ taskId, rcaId, authorId, body }) {
    const mentionedUserIds = extractMentionedIds(body);
    const { rows } = await db.query(
      `INSERT INTO comments (task_id, rca_id, author_id, body, mentioned_user_ids)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [taskId || null, rcaId || null, authorId, body, mentionedUserIds]
    );
    return rows[0];
  },

  async listForTask(taskId) {
    const { rows } = await db.query(
      `SELECT c.*, u.name AS author_name FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.task_id = $1 ORDER BY c.created_at ASC`,
      [taskId]
    );
    return rows;
  },

  async listForRca(rcaId) {
    const { rows } = await db.query(
      `SELECT c.*, u.name AS author_name FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.rca_id = $1 ORDER BY c.created_at ASC`,
      [rcaId]
    );
    return rows;
  },

  async delete(id) {
    await db.query('DELETE FROM comments WHERE id = $1', [id]);
  },
};

module.exports = Comment;
