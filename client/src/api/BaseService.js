/**
 * Every resource service extends this so they all share one ApiClient
 * instance (and therefore one token store / base URL) without repeating
 * constructor boilerplate.
 */
export class BaseService {
  constructor(apiClient) {
    this.api = apiClient;
  }
}
