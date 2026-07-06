const Notification = require('../models/notification.model');
const { parsePagination } = require('../utils/pagination');

async function list(req, res) {
  const { limit, offset } = parsePagination(req.query);
  const notifications = await Notification.listForUser(req.user.id, {
    unreadOnly: req.query.unreadOnly === 'true',
    limit,
    offset,
  });
  res.json({ notifications });
}

async function markRead(req, res) {
  const notification = await Notification.markRead(req.params.notificationId, req.user.id);
  res.json({ notification });
}

async function markAllRead(req, res) {
  await Notification.markAllRead(req.user.id);
  res.status(204).send();
}

module.exports = { list, markRead, markAllRead };
