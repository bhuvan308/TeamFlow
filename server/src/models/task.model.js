const db = require('../config/db');

const Task = {
  async create(data) {
    const { rows } = await db.query(
      `INSERT INTO tasks (project_id, parent_task_id, title, description, priority, assignee_id, created_by, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.projectId,
        data.parentTaskId || null,
        data.title,
        data.description || null,
        data.priority || 'medium',
        data.assigneeId || null,
        data.createdBy,
        data.dueDate || null,
      ]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async listByProject(projectId, filters = {}, { limit = 25, offset = 0 } = {}) {
    const clauses = ['project_id = $1'];
    const params = [projectId];
    let idx = 2;

    if (filters.status) {
      clauses.push(`status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.assigneeId) {
      clauses.push(`assignee_id = $${idx++}`);
      params.push(filters.assigneeId);
    }
    if (filters.priority) {
      clauses.push(`priority = $${idx++}`);
      params.push(filters.priority);
    }

    const where = clauses.join(' AND ');
    const { rows } = await db.query(
      `SELECT * FROM tasks WHERE ${where} ORDER BY due_date NULLS LAST, created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    const { rows: countRows } = await db.query(
      `SELECT COUNT(*)::int AS count FROM tasks WHERE ${where}`,
      params
    );
    return { rows, totalCount: countRows[0].count };
  },

  async update(id, fields) {
    const setClauses = [];
    const params = [id];
    let idx = 2;
    for (const [col, val] of Object.entries(fields)) {
      setClauses.push(`${col} = $${idx++}`);
      params.push(val);
    }
    setClauses.push('updated_at = now()');
    const { rows } = await db.query(
      `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );
    return rows[0];
  },

  async updateStatus(id, status) {
    const { rows } = await db.query(
      `UPDATE tasks SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return rows[0];
  },

  async delete(id) {
    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
  },
};

module.exports = Task;
