// express-async-errors (loaded in app.js) already catches rejected promises in
// route handlers, but this wrapper is kept for clarity in service-internal callbacks
// and for any place we bypass the router directly (e.g. events/handlers/*).
function asyncHandler(fn) {
  return function wrapped(...args) {
    return Promise.resolve(fn(...args)).catch((err) => {
      console.error('Unhandled async error:', err);
      throw err;
    });
  };
}

module.exports = { asyncHandler };
