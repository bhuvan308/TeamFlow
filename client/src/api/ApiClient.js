import { ApiError } from './ApiError';

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Thin wrapper around fetch that every resource-specific service composes.
 * Responsibilities are deliberately narrow: build URLs safely, attach the
 * bearer token, enforce a timeout, and translate every failure into an
 * ApiError so callers never branch on fetch's raw error shapes.
 */
export class ApiClient {
  #baseUrl;
  #tokenStore;
  #onUnauthorized;

  constructor(baseUrl, tokenStore) {
    this.#baseUrl = baseUrl.replace(/\/+$/, '');
    this.#tokenStore = tokenStore;
    this.#onUnauthorized = null;
  }

  /** Registered once by AuthContext so a 401 anywhere logs the user out. */
  setUnauthorizedHandler(handler) {
    this.#onUnauthorized = handler;
  }

  get(path, { query, signal } = {}) {
    return this.#send('GET', path, { query, signal });
  }

  post(path, body, { signal } = {}) {
    return this.#send('POST', path, { body, signal });
  }

  patch(path, body, { signal } = {}) {
    return this.#send('PATCH', path, { body, signal });
  }

  delete(path, { signal } = {}) {
    return this.#send('DELETE', path, { signal });
  }

  /** For multipart/form-data uploads - never JSON-encoded. */
  postForm(path, formData, { signal } = {}) {
    return this.#send('POST', path, { formData, signal });
  }

  /** Downloads a binary/text response (CSV export) as a Blob. */
  async getBlob(path, { query } = {}) {
    const response = await this.#fetch(this.#buildUrl(path, query), { method: 'GET' });
    if (!response.ok) throw await this.#toApiError(response);
    return response.blob();
  }

  #buildUrl(path, query) {
    const url = new URL(`${this.#baseUrl}${path}`, window.location.origin);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        url.searchParams.set(key, String(value));
      }
    }
    return url.pathname + (url.search || '');
  }

  async #send(method, path, { query, body, formData, signal } = {}) {
    const headers = {};
    let payload;

    if (formData) {
      payload = formData; // browser sets multipart boundary automatically
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }

    const response = await this.#fetch(this.#buildUrl(path, query), {
      method,
      headers,
      body: payload,
      signal,
    });

    if (response.status === 204) return null;
    if (!response.ok) throw await this.#toApiError(response);

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async #fetch(url, init) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const token = this.#tokenStore.get();

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          ...(init.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: init.signal || controller.signal,
        credentials: 'same-origin',
      });

      if (response.status === 401 && this.#onUnauthorized) {
        this.#onUnauthorized();
      }
      return response;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new ApiError('The request took too long. Please try again.', 0);
      }
      throw new ApiError('Could not reach the server. Check your connection.', 0);
    } finally {
      clearTimeout(timeout);
    }
  }

  async #toApiError(response) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      /* non-JSON error body, e.g. an upstream 502 */
    }
    const message = payload?.error?.message || `Request failed (${response.status})`;
    return new ApiError(message, response.status, payload?.error?.details ?? null);
  }
}
