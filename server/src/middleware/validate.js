const { ApiError } = require('./errorHandler');

// Usage: router.post('/', validate(schema), controller)
// Validates req.body by default; pass { source: 'query' } for query-string validation.
function validate(schema, { source = 'body' } = {}) {
  return function (req, res, next) {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid input', parsed.error.flatten());
    }
    req[source] = parsed.data;
    next();
  };
}

module.exports = { validate };
