import { cacheIncr, cacheGetCounter } from "@/lib/cache";
import { RATE_LIMITS, CACHE_TTL, getTodayDateString, getNextMidnightUTC } from "@/lib/utils";

import type { RateLimitResult } from "./rate-limit.types";

// ============================================================================
// Rate Limiter
//
// Sliding window counter using Redis INCR.
// Each API key gets a daily counter: rl:{apiKeyId}:{YYYY-MM-DD}
// Counter expires at midnight UTC (24h TTL as safety net).
//
// Behavior:
//   - Under limit: Allow request, increment counter
//   - Over limit: Reject with 429 + Retry-After header
//   - Redis failure: Fail-open (allow request, log warning)
// ============================================================================

/**
 * Check rate limit for an API key.
 *
 * @param apiKeyId - The API key ID
 * @param plan - The user's plan (determines limit)
 * @returns RateLimitResult with allowed status and remaining count
 */
export async function checkRateLimit(
  apiKeyId: string,
  plan: string
): Promise<RateLimitResult> {
  const limit = getRateLimitForPlan(plan);
  const today = getTodayDateString();
  const key = `rl:${apiKeyId}:${today}`;
  const resetAt = getNextMidnightUTC();

  // Increment the counter atomically
  const current = await cacheIncr(key, CACHE_TTL.rateLimitWindow);

  // If Redis failed (returns -1), fail-open
  if (current === -1) {
    return {
      allowed: true,
      limit,
      remaining: limit,
      resetAt,
      current: 0,
    };
  }

  const allowed = current <= limit;
  const remaining = Math.max(0, limit - current);

  return {
    allowed,
    limit,
    remaining,
    resetAt,
    current,
  };
}

/**
 * Get the current rate limit usage without incrementing.
 * Used for displaying remaining quota in the dashboard.
 */
export async function getRateLimitStatus(
  apiKeyId: string,
  plan: string
): Promise<RateLimitResult> {
  const limit = getRateLimitForPlan(plan);
  const today = getTodayDateString();
  const key = `rl:${apiKeyId}:${today}`;
  const resetAt = getNextMidnightUTC();

  const current = await cacheGetCounter(key);

  return {
    allowed: current < limit,
    limit,
    remaining: Math.max(0, limit - current),
    resetAt,
    current,
  };
}

/**
 * Get the rate limit for a given plan.
 */
function getRateLimitForPlan(plan: string): number {
  switch (plan) {
    case "enterprise":
      return RATE_LIMITS.enterprise;
    case "pro":
      return RATE_LIMITS.pro;
    case "free":
    default:
      return RATE_LIMITS.free;
  }
}
