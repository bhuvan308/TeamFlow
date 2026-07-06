const db = require('../config/db');

const TaskRelation = {
  async create(sourceTaskId, targetTaskId) {
    const { rows } = await db.query(
      `INSERT INTO task_relations (source_task_id, target_task_id, relation_type)
       VALUES ($1, $2, 'blocked_by')
       ON CONFLICT (source_task_id, target_task_id) DO NOTHING
       RETURNING *`,
      [sourceTaskId, targetTaskId]
    );
    return rows[0] || null;
  },

  async delete(sourceTaskId, targetTaskId) {
    await db.query(
      'DELETE FROM task_relations WHERE source_task_id = $1 AND target_task_id = $2',
      [sourceTaskId, targetTaskId]
    );
  },

  // Tasks that block this task (must complete first).
  async blockers(taskId) {
    const { rows } = await db.query(
      `SELECT t.* FROM task_relations tr
       JOIN tasks t ON t.id = tr.target_task_id
       WHERE tr.source_task_id = $1`,
      [taskId]
    );
    return rows;
  },

  // Tasks that this task blocks.
  async dependents(taskId) {
    const { rows } = await db.query(
      `SELECT t.* FROM task_relations tr
       JOIN tasks t ON t.id = tr.source_task_id
       WHERE tr.target_task_id = $1`,
      [taskId]
    );
    return rows;
  },

  // Detects whether adding source->target would create a cycle by checking
  // if target already (transitively) depends on source.
  async wouldCreateCycle(sourceTaskId, targetTaskId) {
    const { rows } = await db.query(
      `WITH RECURSIVE chain AS (
         SELECT target_task_id AS task_id FROM task_relations WHERE source_task_id = $2
         UNION
         SELECT tr.target_task_id FROM task_relations tr
         JOIN chain c ON tr.source_task_id = c.task_id
       )
       SELECT 1 FROM chain WHERE task_id = $1 LIMIT 1`,
      [sourceTaskId, targetTaskId]
    );
    return rows.length > 0;
  },
};

module.exports = TaskRelation;
