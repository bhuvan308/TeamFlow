import { BaseService } from './BaseService';

const MAX_UPLOAD_MB = 25; // mirrors .env.example MAX_UPLOAD_MB on the backend

export class AttachmentService extends BaseService {
  list(entityKind, entityId) {
    return this.api.get(`/${this.#basePath(entityKind)}/${entityId}/attachments`);
  }

  /** Validates size client-side too, so a rejected upload fails fast rather
   * than waiting on a round trip that multer will reject anyway. */
  upload(entityKind, entityId, file) {
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      return Promise.reject(new Error(`File is larger than the ${MAX_UPLOAD_MB} MB limit.`));
    }
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postForm(`/${this.#basePath(entityKind)}/${entityId}/attachments`, formData);
  }

  #basePath(entityKind) {
    if (entityKind === 'task') return 'tasks';
    if (entityKind === 'rca') return 'rcas';
    throw new Error(`Unknown attachment entity kind: ${entityKind}`);
  }
}

export { MAX_UPLOAD_MB };
