const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const User = require('../src/models/user.model');
const notificationService = require('../src/services/notification.service');
const Notification = require('../src/models/notification.model');

async function makeUser(email) {
  const passwordHash = await bcrypt.hash('x', 4);
  return User.create({ name: email, email, passwordHash });
}

test('duplicate event with same dedupe state is suppressed on second attempt', async () => {
  const user = await makeUser(`notif-${Date.now()}@test.dev`);

  const first = await notificationService.notify({
    userId: user.id,
    eventType: 'task.assigned',
    dedupeState: 'v1',
    payload: { entityId: 'task-123', subject: 'Test', text: 'Test body' },
    channels: ['in_app'],
  });
  assert.equal(first[0].status, 'sent');

  const second = await notificationService.notify({
    userId: user.id,
    eventType: 'task.assigned',
    dedupeState: 'v1', // identical state -> same dedupe key -> should suppress
    payload: { entityId: 'task-123', subject: 'Test', text: 'Test body' },
    channels: ['in_app'],
  });
  assert.equal(second[0].status, 'suppressed_duplicate');

  const list = await Notification.listForUser(user.id);
  assert.equal(list.length, 1); // only one row ever created
});

test.after(async () => {
  await db.pool.end();
});
