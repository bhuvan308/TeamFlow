const express = require('express');
const { requireAuth, requireProjectMember } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const schema = require('../validators/project.schema');
const ctrl = require('../controllers/project.controller');

const router = express.Router();

router.use(requireAuth);

router.post('/', validate(schema.create), ctrl.create);
router.get('/', ctrl.list);
router.get('/:projectId', requireProjectMember(), ctrl.getOne);
router.patch('/:projectId', requireProjectMember(['owner', 'admin']), validate(schema.update), ctrl.update);
router.delete('/:projectId', requireProjectMember(['owner']), ctrl.remove);

router.get('/:projectId/members', requireProjectMember(), ctrl.listMembers);
router.post(
  '/:projectId/members',
  requireProjectMember(['owner', 'admin']),
  validate(schema.addMember),
  ctrl.addMember
);
router.delete('/:projectId/members/:userId', requireProjectMember(['owner', 'admin']), ctrl.removeMember);

router.patch(
  '/:projectId/view-preference',
  requireProjectMember(),
  validate(schema.setViewPreference),
  ctrl.setViewPreference
);

module.exports = router;
