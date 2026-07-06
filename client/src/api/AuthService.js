import { BaseService } from './BaseService';

export class AuthService extends BaseService {
  register({ name, email, password }) {
    return this.api.post('/auth/register', { name, email, password });
  }

  login({ email, password }) {
    return this.api.post('/auth/login', { email, password });
  }

  me() {
    return this.api.get('/auth/me');
  }

  updatePreferences({ theme, emailOptOut }) {
    return this.api.patch('/auth/me/preferences', { theme, emailOptOut });
  }
}
