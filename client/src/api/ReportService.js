import { BaseService } from './BaseService';

export class ReportService extends BaseService {
  dashboard(projectId) {
    return this.api.get(`/projects/${projectId}/reports/dashboard`);
  }

  async downloadTasksCsv(projectId, { status, assigneeId, priority } = {}) {
    const blob = await this.api.getBlob(`/projects/${projectId}/reports/tasks/export`, {
      query: { status, assigneeId, priority },
    });
    this.#triggerDownload(blob, 'tasks-export.csv');
  }

  /** Isolated so it's easy to unit test #dashboard/#downloadTasksCsv without
   * touching the DOM, and so the anchor-click trick lives in one place. */
  #triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}
