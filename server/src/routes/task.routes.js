const express = require('express');
const { requireAuth, requireProjectMember } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { singleFileUpload } = require('../middleware/upload');
const schema = require('../validators/task.schema');
const ctrl = require('../controllers/task.controller');
const relationCtrl = require('../controllers/taskRelation.controller');
const commentCtrl = require('../controllers/comment.controller');
const attachmentCtrl = require('../controllers/attachment.controller');
const Task = require('../models/task.model');
const ProjectMember = require('../models/projectMember.model');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router({ mergeParams: true });

router.use(requireAuth);

// Resolves the task's project and checks membership - used for routes
// addressed by :taskId only (no projectId in the URL).
async function requireTaskMember(req, res, next) {
  const task = await Task.findById(req.params.taskId);
  if (!task) throw new ApiError(404, 'Task not found');
  const membership = await ProjectMember.isMember(task.project_id, req.user.id);
  if (!membership) throw new ApiError(403, "Not a member of this task's project");
  req.task = task;
  next();
}

// --- Project-scoped ---
// Mounted at /api/projects/:projectId/tasks in routes/index.js
router.post('/', requireProjectMember(), validate(schema.create), ctrl.create);
router.get('/', requireProjectMember(), validate(schema.listQuery, { source: 'query' }), ctrl.list);

// --- Task-scoped ---
// Mounted at /api/tasks in routes/index.js
router.get('/:taskId', requireTaskMember, ctrl.getOne);
router.patch('/:taskId', requireTaskMember, validate(schema.update), ctrl.update);
router.delete('/:taskId', requireTaskMember, ctrl.remove);
router.patch('/:taskId/status', requireTaskMember, validate(schema.changeStatus), ctrl.changeStatus);

router.post('/:taskId/dependencies', requireTaskMember, validate(schema.addRelation), ctrl.addDependency);
router.get('/:taskId/dependencies/blockers', requireTaskMember, relationCtrl.listBlockers);
router.get('/:taskId/dependencies/dependents', requireTaskMember, relationCtrl.listDependents);
router.delete('/:taskId/dependencies/:targetTaskId', requireTaskMember, relationCtrl.remove);

router.get('/:taskId/comments', requireTaskMember, commentCtrl.listForTask);
router.post('/:taskId/comments', requireTaskMember, commentCtrl.createForTask);

router.get('/:taskId/attachments', requireTaskMember, attachmentCtrl.listForTask);
router.post(
  '/:taskId/attachments',
  requireTaskMember,
  singleFileUpload('file'),
  attachmentCtrl.uploadForTask
);

module.exports = router;
