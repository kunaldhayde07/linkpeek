import { logger } from "@/lib/utils";

import { getRedis } from "./redis";

// ============================================================================
// Cache Service
// Resilient wrapper around Redis with fail-open semantics
// ============================================================================

/**
 * Get a value from cache.
 * Returns null on cache miss OR cache failure (fail-open).
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    logger.warn("Cache GET failed", {
      key,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return null;
  }
}

/**
 * Set a value in cache with TTL.
 * Fails silently (data is still in DB as source of truth).
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (error) {
    logger.warn("Cache SET failed", {
      key,
      ttl: ttlSeconds,
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
}

/**
 * Delete a value from cache.
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch (error) {
    logger.warn("Cache DEL failed", {
      key,
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
}

/**
 * Increment a counter in Redis (for rate limiting).
 * Returns the new count, or -1 on failure (fail-open).
 */
export async function cacheIncr(key: string, ttlSeconds: number): Promise<number> {
  try {
    const redis = getRedis();
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, ttlSeconds);
    const results = await pipeline.exec();
    const count = results[0] as number;
    return count;
  } catch (error) {
    logger.warn("Cache INCR failed (rate limiting bypassed)", {
      key,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return -1; // Fail-open: allow request
  }
}

/**
 * Get the current value of a counter.
 */
export async function cacheGetCounter(key: string): Promise<number> {
  try {
    const redis = getRedis();
    const value = await redis.get<number>(key);
    return value ?? 0;
  } catch (error) {
    logger.warn("Cache GET counter failed", {
      key,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return 0;
  }
}

/**
 * Check if Redis is healthy (for health check endpoint).
 */
export async function cacheHealthCheck(): Promise<{ status: string; latency?: number }> {
  try {
    const redis = getRedis();
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    return { status: "connected", latency };
  } catch (error) {
    return {
      status: "error",
      latency: undefined,
    };
  }
}
