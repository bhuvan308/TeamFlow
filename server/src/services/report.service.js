const db = require('../config/db');

async function completionRate(projectId) {
  const { rows } = await db.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'done')::int AS done
     FROM tasks WHERE project_id = $1`,
    [projectId]
  );
  const { total, done } = rows[0];
  return { total, done, rate: total ? Number((done / total).toFixed(3)) : 0 };
}

async function workloadByAssignee(projectId) {
  const { rows } = await db.query(
    `SELECT u.id AS user_id, u.name,
            COUNT(t.*) FILTER (WHERE t.status <> 'done')::int AS open_tasks,
            COUNT(t.*) FILTER (WHERE t.status = 'done')::int AS completed_tasks
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     LEFT JOIN tasks t ON t.assignee_id = u.id AND t.project_id = pm.project_id
     WHERE pm.project_id = $1
     GROUP BY u.id, u.name
     ORDER BY open_tasks DESC`,
    [projectId]
  );
  return rows;
}

// Tasks completed per ISO week over the last N weeks - a simple velocity proxy.
async function velocityTrend(projectId, weeks = 8) {
  const { rows } = await db.query(
    `SELECT date_trunc('week', updated_at) AS week_start, COUNT(*)::int AS completed
     FROM tasks
     WHERE project_id = $1 AND status = 'done'
       AND updated_at >= now() - ($2 || ' weeks')::interval
     GROUP BY week_start
     ORDER BY week_start ASC`,
    [projectId, weeks]
  );
  return rows;
}

async function rcaVolume(projectId) {
  const { rows } = await db.query(
    `SELECT status, severity, COUNT(*)::int AS count
     FROM rcas WHERE project_id = $1
     GROUP BY status, severity
     ORDER BY status, severity`,
    [projectId]
  );
  return rows;
}

// A simple composite score: high if completion rate is healthy and no
// critical RCAs are stuck open beyond a week.
async function projectHealth(projectId) {
  const { total, done, rate } = await completionRate(projectId);
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS stale_critical_rcas FROM rcas
     WHERE project_id = $1 AND severity = 'critical' AND status NOT IN ('closed', 'rejected')
       AND created_at < now() - interval '7 days'`,
    [projectId]
  );
  const staleCritical = rows[0].stale_critical_rcas;

  let health = 'healthy';
  if (staleCritical > 0) health = 'at_risk';
  else if (total > 0 && rate < 0.3) health = 'watch';

  return { health, completionRate: rate, staleCriticalRcas: staleCritical, totalTasks: total, doneTasks: done };
}

async function dashboard(projectId) {
  const [completion, workload, velocity, rcas, health] = await Promise.all([
    completionRate(projectId),
    workloadByAssignee(projectId),
    velocityTrend(projectId),
    rcaVolume(projectId),
    projectHealth(projectId),
  ]);
  return { completion, workload, velocity, rcas, health };
}

module.exports = { completionRate, workloadByAssignee, velocityTrend, rcaVolume, projectHealth, dashboard };
