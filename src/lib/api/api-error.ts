// ============================================================================
// API Error Classes
// Structured error hierarchy for consistent error handling
// ============================================================================

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_URL"
  | "MISSING_API_KEY"
  | "INVALID_API_KEY"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "BATCH_LIMIT_EXCEEDED"
  | "FETCH_FAILED"
  | "PLAYWRIGHT_ERROR"
  | "SCREENSHOT_ERROR"
  | "KEY_LIMIT_EXCEEDED"
  | "DUPLICATE_RESOURCE"
  | "EXPORT_ERROR"
  | "IMPORT_ERROR"
  | "INTERNAL_ERROR";

/**
 * Base application error class.
 * All domain-specific errors extend this.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/** 400 — Invalid input data */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/** 400 — Invalid URL format or blocked URL */
export class InvalidUrlError extends AppError {
  constructor(message: string = "Invalid or blocked URL", details?: Record<string, unknown>) {
    super(message, 400, "INVALID_URL", details);
    this.name = "InvalidUrlError";
  }
}

/** 401 — Missing authentication credentials */
export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication required",
    code: ErrorCode = "MISSING_API_KEY"
  ) {
    super(message, 401, code);
    this.name = "AuthenticationError";
  }
}

/** 403 — Insufficient permissions */
export class AuthorizationError extends AppError {
  constructor(message: string = "You do not have permission to access this resource") {
    super(message, 403, "FORBIDDEN");
    this.name = "AuthorizationError";
  }
}

/** 404 — Resource not found */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/** 429 — Rate limit exceeded */
export class RateLimitError extends AppError {
  constructor(
    limit: number,
    remaining: number,
    resetAt: number
  ) {
    super("You have exceeded your rate limit", 429, "RATE_LIMIT_EXCEEDED", {
      limit,
      remaining,
      resetAt,
    });
    this.name = "RateLimitError";
  }
}

/** 422 — Failed to fetch target URL */
export class FetchError extends AppError {
  constructor(message: string, url?: string) {
    super(message, 422, "FETCH_FAILED", url ? { url } : undefined);
    this.name = "FetchError";
  }
}

/** 422 — Playwright rendering failure */
export class PlaywrightError extends AppError {
  constructor(message: string) {
    super(message, 422, "PLAYWRIGHT_ERROR");
    this.name = "PlaywrightError";
  }
}

/** 409 — Duplicate resource */
export class DuplicateError extends AppError {
  constructor(resource: string) {
    super(`${resource} already exists`, 409, "DUPLICATE_RESOURCE");
    this.name = "DuplicateError";
  }
}

/**
 * Type guard: checks if an error is an AppError instance.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
