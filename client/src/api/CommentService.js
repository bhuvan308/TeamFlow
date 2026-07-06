import { BaseService } from './BaseService';

/**
 * Comments hang off either a task or an RCA. The backend exposes them as
 * two parallel route trees; this service exposes that as one class with an
 * explicit "entity kind" so callers don't need to know two method names.
 */
export class CommentService extends BaseService {
  list(entityKind, entityId) {
    return this.api.get(`/${this.#basePath(entityKind)}/${entityId}/comments`);
  }

  create(entityKind, entityId, body) {
    return this.api.post(`/${this.#basePath(entityKind)}/${entityId}/comments`, { body });
  }

  #basePath(entityKind) {
    if (entityKind === 'task') return 'tasks';
    if (entityKind === 'rca') return 'rcas';
    throw new Error(`Unknown comment entity kind: ${entityKind}`);
  }
}
