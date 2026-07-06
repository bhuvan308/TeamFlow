const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const User = require('../src/models/user.model');
const Project = require('../src/models/project.model');
const rcaService = require('../src/services/rca.service');
const reviewService = require('../src/services/review.service');
const RCASection = require('../src/models/rcaSection.model');

async function makeUser(email) {
  const passwordHash = await bcrypt.hash('x', 4);
  return User.create({ name: email, email, passwordHash });
}

async function fillSections(rcaId, actorId) {
  const types = ['timeline', 'contributing_factors', 'corrective_actions', 'preventive_measures'];
  for (const t of types) {
    await rcaService.updateSection(rcaId, t, `content for ${t}`, actorId);
  }
}

test('RCA cannot submit without all sections filled', async () => {
  const owner = await makeUser(`rca-owner-${Date.now()}@test.dev`);
  const project = await Project.create({ name: 'RCA Test Project', ownerId: owner.id });
  const rca = await rcaService.createRca({ projectId: project.id, title: 'Incident', severity: 'high' }, owner.id);

  await assert.rejects(() => rcaService.submit(rca.id, owner.id), /sections must have content/);
});

test('RCA stays open until every reviewer decides; closes only when all approve', async () => {
  const owner = await makeUser(`rca-owner2-${Date.now()}@test.dev`);
  const reviewer1 = await makeUser(`rev1-${Date.now()}@test.dev`);
  const reviewer2 = await makeUser(`rev2-${Date.now()}@test.dev`);
  const project = await Project.create({ name: 'RCA Test Project 2', ownerId: owner.id });

  const rca = await rcaService.createRca(
    { projectId: project.id, title: 'Two-reviewer incident', severity: 'critical' },
    owner.id
  );
  await fillSections(rca.id, owner.id);
  await rcaService.assignReviewer(rca.id, reviewer1.id, owner.id);
  await rcaService.assignReviewer(rca.id, reviewer2.id, owner.id);
  await rcaService.submit(rca.id, owner.id);

  const afterFirst = await reviewService.decide(rca.id, reviewer1.id, 'approved', 'Looks good', reviewer1.id);
  assert.equal(afterFirst.outcome.status, null); // still waiting on reviewer2

  const afterSecond = await reviewService.decide(rca.id, reviewer2.id, 'rejected', 'Missing root cause', reviewer2.id);
  assert.equal(afterSecond.outcome.status, 'rejected'); // any rejection -> rejected, not silently closed
});

test.after(async () => {
  await db.pool.end();
});
