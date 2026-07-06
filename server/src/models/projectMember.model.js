const db = require('../config/db');

const ProjectMember = {
  async isMember(projectId, userId) {
    const { rows } = await db.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    return rows[0] || null;
  },

  async listUserIds(projectId) {
    const { rows } = await db.query('SELECT user_id FROM project_members WHERE project_id = $1', [
      projectId,
    ]);
    return rows.map((r) => r.user_id);
  },

  async countOpenTasksForAssignee(projectId, userId) {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS count FROM tasks
       WHERE project_id = $1 AND assignee_id = $2 AND status NOT IN ('done')`,
      [projectId, userId]
    );
    return rows[0].count;
  },
};

module.exports = ProjectMember;
