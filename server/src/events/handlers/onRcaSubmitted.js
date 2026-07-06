const bus = require('../eventBus');
const notificationService = require('../../services/notification.service');

bus.on('rca.submitted', async ({ rca, reviewerIds }) => {
  for (const reviewerId of reviewerIds) {
    await notificationService.notify({
      userId: reviewerId,
      eventType: 'rca.submitted',
      dedupeState: rca.updated_at,
      payload: {
        entityId: rca.id,
        subject: `RCA ready for review: ${rca.title}`,
        text: `"${rca.title}" (severity: ${rca.severity}) has been submitted and needs your review.`,
      },
    });
  }
});
