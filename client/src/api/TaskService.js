import { BaseService } from './BaseService';

export class TaskService extends BaseService {
  create(projectId, { parentTaskId, title, description, priority, assigneeId, dueDate }) {
    return this.api.post(`/projects/${projectId}/tasks`, {
      project_id: projectId,
      parentTaskId,
      title,
      description,
      priority,
      assigneeId,
      dueDate,
    });
  }

  list(projectId, { status, assigneeId, priority, page, limit } = {}) {
    return this.api.get(`/projects/${projectId}/tasks`, {
      query: { status, assigneeId, priority, page, limit },
    });
  }

  getOne(taskId) {
    return this.api.get(`/tasks/${taskId}`);
  }

  update(taskId, fields) {
    return this.api.patch(`/tasks/${taskId}`, fields);
  }

  remove(taskId) {
    return this.api.delete(`/tasks/${taskId}`);
  }

  changeStatus(taskId, status) {
    return this.api.patch(`/tasks/${taskId}/status`, { status });
  }

  addDependency(taskId, targetTaskId) {
    return this.api.post(`/tasks/${taskId}/dependencies`, { targetTaskId });
  }

  listBlockers(taskId) {
    return this.api.get(`/tasks/${taskId}/dependencies/blockers`);
  }

  listDependents(taskId) {
    return this.api.get(`/tasks/${taskId}/dependencies/dependents`);
  }

  removeDependency(taskId, targetTaskId) {
    return this.api.delete(`/tasks/${taskId}/dependencies/${targetTaskId}`);
  }
}

/** Task lifecycle and priority vocab, kept next to the service that uses it
 * so UI and API stay in lockstep with validators/task.schema.js. */
export const TASK_STATUSES = ['todo', 'in_progress', 'in_review', 'done', 'blocked'];
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const TASK_STATUS_LABELS = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
  blocked: 'Blocked',
};
