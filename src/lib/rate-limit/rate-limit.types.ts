// ============================================================================
// Rate Limit Types
// ============================================================================

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window duration identifier (e.g., "day") */
  window: "day";
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Maximum requests in this window */
  limit: number;
  /** Remaining requests in this window */
  remaining: number;
  /** Unix timestamp when the limit resets */
  resetAt: number;
  /** Current request count */
  current: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number;
}
