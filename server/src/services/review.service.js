const Review = require('../models/review.model');
const RCA = require('../models/rca.model');
const rcaService = require('./rca.service');
const activityLog = require('./activityLog.service');
const bus = require('../events/eventBus');
const { ApiError } = require('../middleware/errorHandler');

async function decide(rcaId, reviewerId, decision, comment, actorId) {
  const rca = await RCA.findById(rcaId);
  if (!rca) throw new ApiError(404, 'RCA not found');
  if (rca.status !== 'submitted' && rca.status !== 'in_review') {
    throw new ApiError(422, 'This RCA is not currently open for review');
  }
  if (!comment || !comment.trim()) {
    throw new ApiError(422, 'A comment is mandatory when recording a review decision');
  }

  const review = await Review.recordDecision(rcaId, reviewerId, decision, comment);
  if (!review) throw new ApiError(404, 'This user is not an assigned reviewer for this RCA');

  await activityLog.log('rca', rcaId, actorId, 'review_decided', { reviewerId, decision });
  bus.emit('review.decided', { rca, review });

  // Immediately check whether this was the last outstanding decision.
  const outcome = await rcaService.evaluateAfterDecision(rcaId);
  return { review, outcome };
}

module.exports = { decide };
