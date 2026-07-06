const reviewService = require('../services/review.service');

async function decide(req, res) {
  const { review, outcome } = await reviewService.decide(
    req.params.rcaId,
    req.user.id,
    req.body.decision,
    req.body.comment,
    req.user.id
  );
  res.json({ review, rcaOutcome: outcome });
}

module.exports = { decide };
