const bus = require('../eventBus');
const notificationService = require('../../services/notification.service');

bus.on('task.assigned', async ({ task, assigneeId, actorId }) => {
  if (!assigneeId || assigneeId === actorId) return; // don't notify yourself
  await notificationService.notify({
    userId: assigneeId,
    eventType: 'task.assigned',
    dedupeState: task.updated_at, // re-assignment (new updated_at) is a new alert, not a dup
    payload: {
      entityId: task.id,
      subject: `You were assigned: ${task.title}`,
      text: `You were assigned to task "${task.title}" in project ${task.project_id}.`,
    },
  });
});
