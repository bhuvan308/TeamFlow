require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Task = require('../models/task.model');
const TaskRelation = require('../models/taskRelation.model');
const RCA = require('../models/rca.model');
const Review = require('../models/review.model');

async function upsertUser(name, email) {
  const existing = await User.findByEmail(email);
  if (existing) return existing;
  const passwordHash = await bcrypt.hash('password123', 10);
  return User.create({ name, email, passwordHash });
}

async function run() {
  console.log('Seeding demo data...');

  const alice = await upsertUser('Alice Owner', 'alice@teamflow.dev');
  const bob = await upsertUser('Bob Engineer', 'bob@teamflow.dev');
  const carol = await upsertUser('Carol Reviewer', 'carol@teamflow.dev');

  const project = await Project.create({
    name: 'Payments Platform Revamp',
    description: 'Demo project for the TeamFlow walkthrough.',
    ownerId: alice.id,
  });
  await Project.addMember(project.id, bob.id, 'member');
  await Project.addMember(project.id, carol.id, 'member');

  const setupTask = await Task.create({
    projectId: project.id,
    title: 'Provision staging database',
    description: 'Stand up the staging Postgres instance and run migrations.',
    priority: 'high',
    assigneeId: bob.id,
    createdBy: alice.id,
    dueDate: null,
  });

  const dependentTask = await Task.create({
    projectId: project.id,
    title: 'Run integration test suite',
    description: 'Depends on staging DB being ready.',
    priority: 'medium',
    assigneeId: bob.id,
    createdBy: alice.id,
    dueDate: null,
  });
  await TaskRelation.create(dependentTask.id, setupTask.id); // dependentTask blocked_by setupTask

  const rca = await RCA.create({
    projectId: project.id,
    title: 'Payment webhook duplicate charge incident',
    severity: 'critical',
    createdBy: alice.id,
  });
  await Review.assignReviewer(rca.id, carol.id);

  console.log('Seed complete:');
  console.log({ project: project.id, setupTask: setupTask.id, dependentTask: dependentTask.id, rca: rca.id });
  console.log('Login with alice@teamflow.dev / bob@teamflow.dev / carol@teamflow.dev, password: password123');

  await db.pool.end();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
