// A dedupe key identifies "the same logical alert" regardless of how many times
// the triggering event is published (e.g. a queue retry after a processing lag).
// Format: <event_type>:<entity_id>:<significant_state> — deliberately excludes
// timestamps or message ids, which would defeat the point.
function buildDedupeKey(eventType, entityId, state = '') {
  return `${eventType}:${entityId}:${state}`.slice(0, 200);
}

module.exports = { buildDedupeKey };
