import { Redis } from "@upstash/redis";

import { logger } from "@/lib/utils";

/**
 * Upstash Redis Client Singleton
 *
 * Uses HTTP-based protocol — compatible with Vercel serverless functions
 * (no persistent TCP connection needed).
 */

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      logger.warn("Redis credentials not configured — cache disabled");
      // Return a no-op Redis instance for development without Redis
      return new Proxy({} as Redis, {
        get: (_target, prop) => {
          if (typeof prop === "string") {
            return async () => null;
          }
          return undefined;
        },
      });
    }

    redis = new Redis({ url, token });
  }

  return redis;
}
