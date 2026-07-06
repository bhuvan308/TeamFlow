const Task = require('../models/task.model');
const { toCsv } = require('../utils/csv');

const TASK_COLUMNS = [
  { label: 'ID', value: 'id' },
  { label: 'Title', value: 'title' },
  { label: 'Status', value: 'status' },
  { label: 'Priority', value: 'priority' },
  { label: 'Assignee', value: 'assignee_id' },
  { label: 'Due Date', value: (row) => (row.due_date ? row.due_date.toISOString().slice(0, 10) : '') },
  { label: 'Created At', value: (row) => row.created_at.toISOString() },
];

// Reuses the exact same filter object the list endpoint uses, so "export
// scoped to the active filter" is guaranteed to match what's on screen -
// there's no second, divergent query path for exports.
async function exportTasksCsv(projectId, filters) {
  const { rows } = await Task.listByProject(projectId, filters, { limit: 100000, offset: 0 });
  return toCsv(rows, TASK_COLUMNS);
}

module.exports = { exportTasksCsv };
