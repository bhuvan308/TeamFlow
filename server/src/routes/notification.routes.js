const express = require('express');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/notification.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', ctrl.list);
router.patch('/:notificationId/read', ctrl.markRead);
router.post('/read-all', ctrl.markAllRead);

module.exports = router;
