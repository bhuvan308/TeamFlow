/**
 * Normalized error shape for every failed request. Mirrors the backend's
 * `{ error: { message, details } }` envelope from middleware/errorHandler.js.
 */
export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  get isAuthError() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidationError() {
    return this.status === 400 && this.details;
  }

  /** Flattens zod's { formErrors, fieldErrors } into a single readable string. */
  firstFieldError() {
    const fieldErrors = this.details?.fieldErrors;
    if (!fieldErrors) return null;
    const [field, messages] = Object.entries(fieldErrors).find(([, v]) => v?.length) || [];
    return field ? `${field}: ${messages[0]}` : null;
  }
}
