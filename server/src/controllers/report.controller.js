const reportService = require('../services/report.service');
const exportService = require('../services/export.service');

async function dashboard(req, res) {
  const data = await reportService.dashboard(req.params.projectId);
  res.json(data);
}

async function exportTasks(req, res) {
  const csv = await exportService.exportTasksCsv(req.params.projectId, {
    status: req.query.status,
    assigneeId: req.query.assigneeId,
    priority: req.query.priority,
  });
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="tasks-export.csv"');
  res.send(csv);
}

module.exports = { dashboard, exportTasks };
