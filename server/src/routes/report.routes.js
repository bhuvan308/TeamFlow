const express = require('express');
const { requireAuth, requireProjectMember } = require('../middleware/auth');
const ctrl = require('../controllers/report.controller');

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireProjectMember());

router.get('/dashboard', ctrl.dashboard);
router.get('/tasks/export', ctrl.exportTasks);

module.exports = router;
