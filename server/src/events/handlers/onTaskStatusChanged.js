const bus = require('../eventBus');
const notificationService = require('../../services/notification.service');

bus.on('task.statusChanged', async ({ task, actorId, previousStatus }) => {
  if (!task.assignee_id || task.assignee_id === actorId) return;
  await notificationService.notify({
    userId: task.assignee_id,
    eventType: 'task.statusChanged',
    dedupeState: `${previousStatus}->${task.status}:${task.updated_at}`,
    payload: {
      entityId: task.id,
      subject: `Task status updated: ${task.title}`,
      text: `"${task.title}" moved from ${previousStatus} to ${task.status}.`,
    },
  });
});
