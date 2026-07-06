const Task = require('../models/task.model');
const taskService = require('../services/task.service');
const { parsePagination, buildPageMeta } = require('../utils/pagination');
const { ApiError } = require('../middleware/errorHandler');

async function create(req, res) {
  const warning = await taskService.checkAssigneeOverload(req.body.project_id, req.body.assigneeId);
  const task = await taskService.createTask(
    {
      projectId: req.body.project_id,
      parentTaskId: req.body.parentTaskId,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      assigneeId: req.body.assigneeId,
      dueDate: req.body.dueDate,
    },
    req.user.id
  );
  res.status(201).json({ task, warnings: warning ? [warning] : [] });
}

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await Task.listByProject(
    req.params.projectId,
    {
      status: req.query.status,
      assigneeId: req.query.assigneeId,
      priority: req.query.priority,
    },
    { limit, offset }
  );
  res.json({ tasks: rows, meta: buildPageMeta({ page, limit, totalCount }) });
}

async function getOne(req, res) {
  const task = await Task.findById(req.params.taskId);
  if (!task) throw new ApiError(404, 'Task not found');
  res.json({ task });
}

async function update(req, res) {
  let warning = null;
  if (req.body.assigneeId) {
    const task = await Task.findById(req.params.taskId);
    warning = await taskService.checkAssigneeOverload(task.project_id, req.body.assigneeId);
  }
  const task = await taskService.updateTask(req.params.taskId, req.body, req.user.id);
  res.json({ task, warnings: warning ? [warning] : [] });
}

async function remove(req, res) {
  await Task.delete(req.params.taskId);
  res.status(204).send();
}

async function changeStatus(req, res) {
  const { task, warnings } = await taskService.changeStatus(req.params.taskId, req.body.status, req.user.id);
  res.json({ task, warnings });
}

async function addDependency(req, res) {
  const relation = await taskService.addDependency(req.params.taskId, req.body.targetTaskId, req.user.id);
  res.status(201).json({ relation });
}

module.exports = { create, list, getOne, update, remove, changeStatus, addDependency };
