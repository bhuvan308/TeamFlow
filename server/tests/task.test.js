// Lightweight integration-style tests. Requires a running Postgres reachable
// via DATABASE_URL, with migrations already applied.
// Run with: node --test tests/task.test.js  (Node 18+ built-in test runner)

const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const User = require('../src/models/user.model');
const Project = require('../src/models/project.model');
const taskService = require('../src/services/task.service');

async function makeUser(email) {
  const passwordHash = await bcrypt.hash('x', 4);
  return User.create({ name: email, email, passwordHash });
}

test('task cannot skip from todo directly to done', async () => {
  const owner = await makeUser(`owner-${Date.now()}@test.dev`);
  const project = await Project.create({ name: 'Test Project', ownerId: owner.id });
  const task = await taskService.createTask(
    { projectId: project.id, title: 'Sample task' },
    owner.id
  );

  await assert.rejects(
    () => taskService.changeStatus(task.id, 'done', owner.id),
    /Cannot move task/
  );
});

test('valid transition chain succeeds', async () => {
  const owner = await makeUser(`owner2-${Date.now()}@test.dev`);
  const project = await Project.create({ name: 'Test Project 2', ownerId: owner.id });
  const task = await taskService.createTask(
    { projectId: project.id, title: 'Sample task 2' },
    owner.id
  );

  const step1 = await taskService.changeStatus(task.id, 'in_progress', owner.id);
  assert.equal(step1.task.status, 'in_progress');

  const step2 = await taskService.changeStatus(task.id, 'in_review', owner.id);
  assert.equal(step2.task.status, 'in_review');

  const step3 = await taskService.changeStatus(task.id, 'done', owner.id);
  assert.equal(step3.task.status, 'done');
});

test('circular dependency is rejected', async () => {
  const owner = await makeUser(`owner3-${Date.now()}@test.dev`);
  const project = await Project.create({ name: 'Test Project 3', ownerId: owner.id });
  const taskA = await taskService.createTask({ projectId: project.id, title: 'A' }, owner.id);
  const taskB = await taskService.createTask({ projectId: project.id, title: 'B' }, owner.id);

  await taskService.addDependency(taskB.id, taskA.id, owner.id); // B depends on A
  await assert.rejects(
    () => taskService.addDependency(taskA.id, taskB.id, owner.id), // A depends on B -> cycle
    /circular/
  );
});

test.after(async () => {
  await db.pool.end();
});
