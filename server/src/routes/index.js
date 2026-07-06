const express = require('express');

const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const taskRoutes = require('./task.routes');
const rcaRoutes = require('./rca.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

// Project-scoped: list/create tasks and RCAs within a project.
router.use('/projects/:projectId/tasks', taskRoutes);
router.use('/projects/:projectId/rcas', rcaRoutes);
router.use('/projects/:projectId/reports', reportRoutes);

// Resource-scoped: everything else keyed by task/RCA id directly.
router.use('/tasks', taskRoutes);
router.use('/rcas', rcaRoutes);

router.use('/notifications', notificationRoutes);

module.exports = router;
