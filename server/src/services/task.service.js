const Task = require('../models/task.model');
const TaskRelation = require('../models/taskRelation.model');
const ProjectMember = require('../models/projectMember.model');
const activityLog = require('./activityLog.service');
const bus = require('../events/eventBus');
const { ApiError } = require('../middleware/errorHandler');

// Allowed forward transitions. 'blocked' can be entered/exited from anywhere,
// since a dependency can appear or resolve at any point in the lifecycle.
const TRANSITIONS = {
  todo: ['in_progress', 'blocked'],
  in_progress: ['in_review', 'blocked', 'todo'],
  in_review: ['done', 'in_progress', 'blocked'],
  blocked: ['todo', 'in_progress'],
  done: [], // terminal - reopening means creating a new task, keeps history trustworthy
};

async function createTask(data, actorId) {
  const task = await Task.create({ ...data, createdBy: actorId });
  await activityLog.log('task', task.id, actorId, 'created', { title: task.title });

  if (task.assignee_id) {
    bus.emit('task.assigned', { task, assigneeId: task.assignee_id, actorId });
  }
  return task;
}
async function updateTask(taskId, fields, actorId) {
  const before = await Task.findById(taskId);
  if (!before) throw new ApiError(404, 'Task not found');

  // Convert frontend camelCase fields to database snake_case
  const dbFields = { ...fields };

  if ('assigneeId' in dbFields) {
    dbFields.assignee_id = dbFields.assigneeId;
    delete dbFields.assigneeId;
  }

  if ('parentTaskId' in dbFields) {
    dbFields.parent_task_id = dbFields.parentTaskId;
    delete dbFields.parentTaskId;
  }

  if ('dueDate' in dbFields) {
    dbFields.due_date = dbFields.dueDate;
    delete dbFields.dueDate;
  }

  const task = await Task.update(taskId, dbFields);

  await activityLog.log('task', taskId, actorId, 'updated', {
    fields: Object.keys(dbFields),
  });

  if (fields.assigneeId && fields.assigneeId !== before.assignee_id) {
    bus.emit('task.assigned', {
      task,
      assigneeId: fields.assigneeId,
      actorId,
    });
  }

  return task;
}

// Returns { task, warnings: string[] }. Warnings never block the save - per
// the design doc, "dependency conflicts and assignee overload are surfaced
// as warnings without blocking saves."
async function changeStatus(taskId, newStatus, actorId) {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const allowed = TRANSITIONS[task.status] || [];
  if (task.status !== newStatus && !allowed.includes(newStatus)) {
    throw new ApiError(
      422,
      `Cannot move task from "${task.status}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}`
    );
  }

  const warnings = [];
  if (newStatus === 'done' || newStatus === 'in_review') {
    const blockers = await TaskRelation.blockers(taskId);
    const incompleteBlockers = blockers.filter((b) => b.status !== 'done');
    if (incompleteBlockers.length) {
      warnings.push(
        `${incompleteBlockers.length} blocking task(s) are not yet done: ${incompleteBlockers
          .map((b) => b.title)
          .join(', ')}`
      );
    }
  }

  const updated = await Task.updateStatus(taskId, newStatus);
  await activityLog.log('task', taskId, actorId, 'status_changed', {
    from: task.status,
    to: newStatus,
    warnings,
  });

  bus.emit('task.statusChanged', { task: updated, actorId, previousStatus: task.status });
  return { task: updated, warnings };
}

// Adds a "source depends on target" edge. Returns warnings rather than
// rejecting outright, except for actual cycles, which are structurally invalid
// and must be blocked (a warning wouldn't be meaningful here).
async function addDependency(sourceTaskId, targetTaskId, actorId) {
  if (sourceTaskId === targetTaskId) {
    throw new ApiError(422, 'A task cannot depend on itself');
  }
  const wouldCycle = await TaskRelation.wouldCreateCycle(sourceTaskId, targetTaskId);
  if (wouldCycle) {
    throw new ApiError(422, 'This dependency would create a circular chain');
  }

  const relation = await TaskRelation.create(sourceTaskId, targetTaskId);
  await activityLog.log('task', sourceTaskId, actorId, 'dependency_added', { targetTaskId });
  return relation;
}

// Warns (does not block) when assigning would push a member's open task count
// past a soft threshold.
async function checkAssigneeOverload(projectId, assigneeId, threshold = 8) {
  if (!assigneeId) return null;
  const count = await ProjectMember.countOpenTasksForAssignee(projectId, assigneeId);
  if (count >= threshold) {
    return `This assignee now has ${count + 1} open tasks in this project, which may indicate overload.`;
  }
  return null;
}

module.exports = { createTask, updateTask, changeStatus, addDependency, checkAssigneeOverload };
