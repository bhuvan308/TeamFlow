const Notification = require('../models/notification.model');
const { buildDedupeKey } = require('../utils/dedupeKey');
const emailService = require('./email.service');

// Core rule from the design doc: "every alert is logged before dispatch, and
// duplicates are suppressed." We insert the notification row FIRST (this is
// both the log entry and the dedupe check, via the DB unique constraint on
// (user_id, dedupe_key, channel)) and only attempt delivery if the insert
// actually happened. If the row already existed, createIfNotDuplicate returns
// null and we skip delivery entirely - this is what "duplicate suppression"
// means concretely here.
async function notify({ userId, eventType, dedupeState, payload = {}, channels = ['in_app', 'email'] }) {
  const dedupeKey = buildDedupeKey(eventType, payload.entityId || 'na', dedupeState);
  const results = [];

  for (const channel of channels) {
    const record = await Notification.createIfNotDuplicate({
      userId,
      eventType,
      dedupeKey,
      payload,
      channel,
    });

    if (!record) {
      results.push({ channel, status: 'suppressed_duplicate' });
      continue;
    }

    if (channel === 'in_app') {
      // In-app delivery is just the row existing - the bell indicator reads
      // straight from the notifications table (see notification.controller.js).
      await Notification.markSent(record.id);
      results.push({ channel, status: 'sent' });
      continue;
    }

    if (channel === 'email') {
      try {
        const outcome = await emailService.sendEmail({
          userId,
          subject: payload.subject || eventType,
          text: payload.text || '',
        });
        if (outcome.skipped) {
          await Notification.markSent(record.id); // logged, correctly not delivered due to opt-out
          results.push({ channel, status: 'skipped_opt_out' });
        } else {
          await Notification.markSent(record.id);
          results.push({ channel, status: 'sent' });
        }
      } catch (err) {
        await Notification.markFailed(record.id);
        // Per "Known Limitations": email failures surface to the user rather
        // than silently retrying in the background.
        results.push({ channel, status: 'failed', error: err.message });
      }
    }
  }

  return results;
}

module.exports = { notify };
