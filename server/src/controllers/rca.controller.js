const RCA = require('../models/rca.model');
const RCASection = require('../models/rcaSection.model');
const Review = require('../models/review.model');
const rcaService = require('../services/rca.service');
const { ApiError } = require('../middleware/errorHandler');

async function create(req, res) {
  const rca = await rcaService.createRca(
    {
      projectId: req.params.projectId,
      title: req.body.title,
      severity: req.body.severity,
    },
    req.user.id
  );

  res.status(201).json({ rca });
}

async function list(req, res, next) {
  try {
    console.log("Project ID:", req.params.projectId);

    const rcas = await RCA.listByProject(req.params.projectId);

    res.json({ rcas });
  } catch (err) {
    console.error("RCA List Error:", err);
    next(err);
  }
}

async function getOne(req, res) {
  const rca = await RCA.findById(req.params.rcaId);
  if (!rca) throw new ApiError(404, 'RCA not found');
  const [sections, reviewers] = await Promise.all([
    RCASection.listForRca(rca.id),
    Review.listForRca(rca.id),
  ]);
  res.json({ rca, sections, reviewers });
}

async function updateSection(req, res) {
  const section = await rcaService.updateSection(
    req.params.rcaId,
    req.body.sectionType,
    req.body.content,
    req.user.id
  );
  res.json({ section });
}

async function assignReviewer(req, res) {
  const review = await rcaService.assignReviewer(req.params.rcaId, req.body.reviewerId, req.user.id);
  res.status(201).json({ review });
}

async function removeReviewer(req, res) {
  await rcaService.removeReviewer(req.params.rcaId, req.params.reviewerId, req.user.id);
  res.status(204).send();
}

async function submit(req, res) {
  const rca = await rcaService.submit(req.params.rcaId, req.user.id);
  res.json({ rca });
}

module.exports = { create, list, getOne, updateSection, assignReviewer, removeReviewer, submit };
