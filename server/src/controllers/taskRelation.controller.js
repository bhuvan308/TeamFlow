const TaskRelation = require('../models/taskRelation.model');

async function listBlockers(req, res) {
  const blockers = await TaskRelation.blockers(req.params.taskId);
  res.json({ blockers });
}

async function listDependents(req, res) {
  const dependents = await TaskRelation.dependents(req.params.taskId);
  res.json({ dependents });
}

async function remove(req, res) {
  await TaskRelation.delete(req.params.taskId, req.params.targetTaskId);
  res.status(204).send();
}

module.exports = { listBlockers, listDependents, remove };
