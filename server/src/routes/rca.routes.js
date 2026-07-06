const express = require('express');
const { requireAuth, requireProjectMember } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { singleFileUpload } = require('../middleware/upload');
const schema = require('../validators/rca.schema');
const reviewSchema = require('../validators/review.schema');
const ctrl = require('../controllers/rca.controller');
const reviewCtrl = require('../controllers/review.controller');
const commentCtrl = require('../controllers/comment.controller');
const attachmentCtrl = require('../controllers/attachment.controller');
const RCA = require('../models/rca.model');
const ProjectMember = require('../models/projectMember.model');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router({ mergeParams: true });

router.use(requireAuth);

async function requireRcaMember(req, res, next) {
  const rca = await RCA.findById(req.params.rcaId);
  if (!rca) throw new ApiError(404, 'RCA not found');
  const membership = await ProjectMember.isMember(rca.project_id, req.user.id);
  if (!membership) throw new ApiError(403, "Not a member of this RCA's project");
  req.rca = rca;
  next();
}

// --- Project-scoped ---
// Mounted at /api/projects/:projectId/rcas
router.post('/', requireProjectMember(), validate(schema.create), ctrl.create);
router.get('/', requireProjectMember(), ctrl.list);

// --- RCA-scoped ---
// Mounted at /api/rcas
router.get('/:rcaId', requireRcaMember, ctrl.getOne);
router.patch('/:rcaId/sections', requireRcaMember, validate(schema.updateSection), ctrl.updateSection);
router.post('/:rcaId/reviewers', requireRcaMember, validate(schema.assignReviewer), ctrl.assignReviewer);
router.delete('/:rcaId/reviewers/:reviewerId', requireRcaMember, ctrl.removeReviewer);
router.post('/:rcaId/submit', requireRcaMember, ctrl.submit);
router.post('/:rcaId/review', requireRcaMember, validate(reviewSchema.decide), reviewCtrl.decide);

router.get('/:rcaId/comments', requireRcaMember, commentCtrl.listForRca);
router.post('/:rcaId/comments', requireRcaMember, commentCtrl.createForRca);

router.get('/:rcaId/attachments', requireRcaMember, attachmentCtrl.listForRca);
router.post('/:rcaId/attachments', requireRcaMember, singleFileUpload('file'), attachmentCtrl.uploadForRca);

module.exports = router;
