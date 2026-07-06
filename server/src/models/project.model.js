const db = require('../config/db');

const Project = {
  async create({ name, description, ownerId }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO projects (name, description, owner_id)
         VALUES ($1, $2, $3) RETURNING *`,
        [name, description || null, ownerId]
      );
      const project = rows[0];
      await client.query(
        `INSERT INTO project_members (project_id, user_id, role)
         VALUES ($1, $2, 'owner')`,
        [project.id, ownerId]
      );
      await client.query('COMMIT');
      return project;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async listForUser(userId) {
    const { rows } = await db.query(
      `SELECT p.*, pm.role, pm.view_preference
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = $1
       ORDER BY p.updated_at DESC`,
      [userId]
    );
    return rows;
  },

  async update(id, { name, description }) {
    const { rows } = await db.query(
      `UPDATE projects SET
         name = COALESCE($2, name),
         description = COALESCE($3, description),
         updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, name ?? null, description ?? null]
    );
    return rows[0];
  },

  async delete(id) {
    await db.query('DELETE FROM projects WHERE id = $1', [id]);
  },
async addMember(projectId, userId, role = 'member') {

  // Check whether the user exists
  const user = await db.query(
    `SELECT id FROM users WHERE id = $1`,
    [userId]
  );

  if (user.rows.length === 0) {
    throw new Error("User not found");
  }

  const { rows } = await db.query(
    `INSERT INTO project_members(project_id,user_id,role)
     VALUES($1,$2,$3)
     ON CONFLICT(project_id,user_id)
     DO UPDATE SET role = EXCLUDED.role
     RETURNING *`,
    [projectId,userId,role]
  );

  return rows[0];
},

  async removeMember(projectId, userId) {
    await db.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [
      projectId,
      userId,
    ]);
  },

  async listMembers(projectId) {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at ASC`,
      [projectId]
    );
    return rows;
  },

  async setViewPreference(projectId, userId, viewPreference) {
    const { rows } = await db.query(
      `UPDATE project_members SET view_preference = $3
       WHERE project_id = $1 AND user_id = $2 RETURNING *`,
      [projectId, userId, viewPreference]
    );
    return rows[0];
  },
};

module.exports = Project;
