const Comment = require('../models/comment.model');
const { ApiError } = require('../middleware/errorHandler');

async function createForTask(req, res) {
  const comment = await Comment.create({ taskId: req.params.taskId, authorId: req.user.id, body: req.body.body });
  res.status(201).json({ comment });
}

async function createForRca(req, res) {
  const comment = await Comment.create({ rcaId: req.params.rcaId, authorId: req.user.id, body: req.body.body });
  res.status(201).json({ comment });
}

async function listForTask(req, res) {
  const comments = await Comment.listForTask(req.params.taskId);
  res.json({ comments });
}

async function listForRca(req, res) {
  const comments = await Comment.listForRca(req.params.rcaId);
  res.json({ comments });
}

async function remove(req, res) {
  await Comment.delete(req.params.commentId);
  res.status(204).send();
}

module.exports = { createForTask, createForRca, listForTask, listForRca, remove };
