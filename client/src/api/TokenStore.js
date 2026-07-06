const STORAGE_KEY = 'teamflow.auth.token';

/**
 * Centralizes where the JWT lives.
 *
 * Security note: the backend only issues a long-lived bearer JWT (no
 * httpOnly-cookie/refresh-token flow), so a browser SPA has no XSS-proof
 * place to keep it. This class keeps the token in memory as the source of
 * truth (so it's never touched by anything other than our own fetch calls)
 * and mirrors it into sessionStorage purely so a page refresh doesn't force
 * a re-login - sessionStorage clears when the tab closes, unlike
 * localStorage. If the backend adds httpOnly-cookie sessions, this class
 * should become a no-op and auth should ride on the cookie instead.
 */
export class TokenStore {
  #token = null;
  #listeners = new Set();

  constructor() {
    try {
      this.#token = window.sessionStorage.getItem(STORAGE_KEY) || null;
    } catch {
      // sessionStorage can throw in locked-down/private-browsing contexts.
      this.#token = null;
    }
  }

  get() {
    return this.#token;
  }

  set(token) {
    this.#token = token;
    try {
      if (token) window.sessionStorage.setItem(STORAGE_KEY, token);
      else window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* best-effort persistence only */
    }
    this.#notify();
  }

  clear() {
    this.set(null);
  }

  isAuthenticated() {
    return Boolean(this.#token);
  }

  onChange(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #notify() {
    for (const listener of this.#listeners) listener(this.#token);
  }
}

export const tokenStore = new TokenStore();
