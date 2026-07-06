const bus = require('../eventBus');
const notificationService = require('../../services/notification.service');

bus.on('review.decided', async ({ rca, review }) => {
  await notificationService.notify({
    userId: rca.created_by,
    eventType: 'review.decided',
    dedupeState: `${review.reviewer_id}:${review.decision}:${review.decided_at}`,
    payload: {
      entityId: rca.id,
      subject: `Review recorded on: ${rca.title}`,
      text: `A reviewer ${review.decision} your RCA "${rca.title}".`,
    },
  });
});
