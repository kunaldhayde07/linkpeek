// ============================================================================
// API Types
// ============================================================================

/** Authenticated API request context (populated by middleware) */
export interface ApiContext {
  requestId: string;
  userId: string;
  apiKeyId: string;
  plan: "free" | "pro" | "enterprise";
  startTime: number;
}

/** Rate limit check result */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  current: number;
}

/** Pagination parameters */
export interface PaginationParams {
  page: number;
  limit: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
