import { BaseService } from './BaseService';

export class ProjectService extends BaseService {
  create({ name, description }) {
    return this.api.post('/projects', { name, description });
  }

  list() {
    return this.api.get('/projects');
  }

  getOne(projectId) {
    return this.api.get(`/projects/${projectId}`);
  }

  update(projectId, { name, description }) {
    return this.api.patch(`/projects/${projectId}`, { name, description });
  }

  remove(projectId) {
    return this.api.delete(`/projects/${projectId}`);
  }

  listMembers(projectId) {
    return this.api.get(`/projects/${projectId}/members`);
  }

  addMember(projectId, { userId, role }) {
    return this.api.post(`/projects/${projectId}/members`, { userId, role });
  }

  removeMember(projectId, userId) {
    return this.api.delete(`/projects/${projectId}/members/${userId}`);
  }

  setViewPreference(projectId, viewPreference) {
    return this.api.patch(`/projects/${projectId}/view-preference`, { viewPreference });
  }
}
