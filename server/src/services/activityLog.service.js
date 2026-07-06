const ActivityLog = require('../models/activityLog.model');

async function log(entityType, entityId, actorId, action, metadata = {}) {
  return ActivityLog.record({ entityType, entityId, actorId, action, metadata });
}

module.exports = { log };
