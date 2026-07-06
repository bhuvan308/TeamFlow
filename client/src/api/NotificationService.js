import { BaseService } from './BaseService';

export class NotificationService extends BaseService {
  list({ unreadOnly, limit, offset } = {}) {
    return this.api.get('/notifications', {
      query: { unreadOnly: unreadOnly ? 'true' : undefined, limit, offset },
    });
  }

  markRead(notificationId) {
    return this.api.patch(`/notifications/${notificationId}/read`, {});
  }

  markAllRead() {
    return this.api.post('/notifications/read-all', {});
  }
}
