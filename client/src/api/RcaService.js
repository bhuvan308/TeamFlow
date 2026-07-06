import { BaseService } from './BaseService';

export class RcaService extends BaseService {
  create(projectId, { title, severity }) {
    return this.api.post(`/projects/${projectId}/rcas`, { project_id: projectId, title, severity });
  }

  list(projectId) {
    return this.api.get(`/projects/${projectId}/rcas`);
  }

  getOne(rcaId) {
    return this.api.get(`/rcas/${rcaId}`);
  }

  updateSection(rcaId, sectionType, content) {
    return this.api.patch(`/rcas/${rcaId}/sections`, { sectionType, content });
  }

  assignReviewer(rcaId, reviewerId) {
    return this.api.post(`/rcas/${rcaId}/reviewers`, { reviewerId });
  }

  removeReviewer(rcaId, reviewerId) {
    return this.api.delete(`/rcas/${rcaId}/reviewers/${reviewerId}`);
  }

  submit(rcaId) {
    return this.api.post(`/rcas/${rcaId}/submit`, {});
  }

  decideReview(rcaId, { decision, comment }) {
    return this.api.post(`/rcas/${rcaId}/review`, { decision, comment });
  }
}

export const RCA_SEVERITIES = ['low', 'medium', 'high', 'critical'];
export const RCA_SECTION_TYPES = [
  'timeline',
  'contributing_factors',
  'corrective_actions',
  'preventive_measures',
];
export const RCA_SECTION_LABELS = {
  timeline: 'Timeline',
  contributing_factors: 'Contributing factors',
  corrective_actions: 'Corrective actions',
  preventive_measures: 'Preventive measures',
};
