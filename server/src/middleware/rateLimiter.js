const { ApiError } = require('./errorHandler');

// In-memory only: fine for a single-instance deployment or dev. A horizontally
// scaled deployment would swap this for a Redis-backed limiter - noted in
// README "Known Limitations" since it's a real scaling boundary, not hidden.
function rateLimiter({ windowMs = 60_000, max = 100 } = {}) {
  const hits = new Map();

  return function (req, res, next) {
    const key = req.ip;
    const now = Date.now();
    const entry = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count += 1;
    hits.set(key, entry);

    if (entry.count > max) {
      throw new ApiError(429, 'Too many requests, please slow down');
    }
    next();
  };
}

module.exports = { rateLimiter };
