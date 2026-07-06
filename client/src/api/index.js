import { ApiClient } from './ApiClient';
import { tokenStore } from './TokenStore';
import { AuthService } from './AuthService';
import { ProjectService } from './ProjectService';
import { TaskService } from './TaskService';
import { RcaService } from './RcaService';
import { CommentService } from './CommentService';
import { AttachmentService } from './AttachmentService';
import { NotificationService } from './NotificationService';
import { ReportService } from './ReportService';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Single composition root: one ApiClient, one TokenStore, and every
 * resource service built on top of them. Import `api` anywhere that needs
 * to talk to the backend instead of constructing services ad hoc - this is
 * what keeps every service sharing one auth/token lifecycle.
 */
class ApiContainer {
  constructor() {
    this.client = new ApiClient(baseUrl, tokenStore);
    this.tokens = tokenStore;

    this.auth = new AuthService(this.client);
    this.projects = new ProjectService(this.client);
    this.tasks = new TaskService(this.client);
    this.rcas = new RcaService(this.client);
    this.comments = new CommentService(this.client);
    this.attachments = new AttachmentService(this.client);
    this.notifications = new NotificationService(this.client);
    this.reports = new ReportService(this.client);
  }
}

export const api = new ApiContainer();
export { ApiError } from './ApiError';
export * from './TaskService';
export * from './RcaService';
export { MAX_UPLOAD_MB } from './AttachmentService';
