const RCA = require('../models/rca.model');
const RCASection = require('../models/rcaSection.model');
const Review = require('../models/review.model');
const activityLog = require('./activityLog.service');
const bus = require('../events/eventBus');
const { ApiError } = require('../middleware/errorHandler');

async function createRca(data, actorId) {
  const rca = await RCA.create({ ...data, createdBy: actorId });
  await activityLog.log('rca', rca.id, actorId, 'created', { title: rca.title, severity: rca.severity });
  return rca;
}

async function updateSection(rcaId, sectionType, content, actorId) {
  const rca = await RCA.findById(rcaId);
  if (!rca) throw new ApiError(404, 'RCA not found');
  if (rca.status !== 'draft') {
    throw new ApiError(422, 'Sections can only be edited while the RCA is in draft');
  }
  const section = await RCASection.update(rcaId, sectionType, content);
  await activityLog.log('rca', rcaId, actorId, 'section_updated', { sectionType });
  return section;
}

async function assignReviewer(rcaId, reviewerId, actorId) {
  const rca = await RCA.findById(rcaId);
  if (!rca) throw new ApiError(404, 'RCA not found');
  if (rca.status === 'closed') throw new ApiError(422, 'Cannot assign reviewers to a closed RCA');

  const review = await Review.assignReviewer(rcaId, reviewerId);
  await activityLog.log('rca', rcaId, actorId, 'reviewer_assigned', { reviewerId });
  return review;
}

// Reviewer becoming unavailable: they can be unassigned only if they haven't
// decided yet. This directly answers the doc's question "what happens when a
// reviewer is unavailable" - an admin removes them and assigns a replacement;
// the RCA simply cannot close until whoever IS assigned has decided.
async function removeReviewer(rcaId, reviewerId, actorId) {
  await Review.removeReviewer(rcaId, reviewerId);
  await activityLog.log('rca', rcaId, actorId, 'reviewer_removed', { reviewerId });
}

async function submit(rcaId, actorId) {
  const rca = await RCA.findById(rcaId);
  if (!rca) throw new ApiError(404, 'RCA not found');
  if (rca.status !== 'draft') throw new ApiError(422, 'Only a draft RCA can be submitted');

  const complete = await RCASection.allSectionsComplete(rcaId);
  if (!complete) {
    throw new ApiError(422, 'All sections must have content before submitting');
  }

  const reviewers = await Review.listForRca(rcaId);
  if (reviewers.length === 0) {
    throw new ApiError(422, 'At least one reviewer must be assigned before submitting');
  }

  const updated = await RCA.updateStatus(rcaId, 'submitted');
  await activityLog.log('rca', rcaId, actorId, 'submitted', {});

  bus.emit('rca.submitted', { rca: updated, reviewerIds: reviewers.map((r) => r.reviewer_id) });
  return updated;
}

// Core rule from the design doc: "an investigation cannot close until all
// assigned reviewers have decided." This is checked here, on top of the
// service.js layer for reviews, so RCA state transitions are the single
// place that can move status to 'closed' or 'rejected'.
async function evaluateAfterDecision(rcaId) {
  const allDecided = await Review.allDecided(rcaId);
  if (!allDecided) {
    return { status: null, reason: 'Still waiting on one or more reviewer decisions' };
  }

  const anyRejected = await Review.anyRejected(rcaId);
  const nextStatus = anyRejected ? 'rejected' : 'closed';
  const rca = await RCA.updateStatus(rcaId, nextStatus);
  await activityLog.log('rca', rcaId, null, 'lifecycle_resolved', { nextStatus });
  return { status: nextStatus, rca };
}

module.exports = {
  createRca,
  updateSection,
  assignReviewer,
  removeReviewer,
  submit,
  evaluateAfterDecision,
};
