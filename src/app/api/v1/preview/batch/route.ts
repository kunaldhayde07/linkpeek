import { type NextRequest } from "next/server";

import {
  successResponse,
  ValidationError,
  withRateLimitHeaders,
} from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { batchPreviewRequestSchema } from "@/lib/preview";
import { generatePreview } from "@/lib/preview/preview.service";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";
import { PREVIEW_LIMITS } from "@/lib/utils";

/**
 * POST /api/v1/preview/batch
 *
 * Generate previews for multiple URLs in a single request.
 * URLs are processed concurrently (max 5 at a time).
 * Each URL counts as one request against the rate limit.
 *
 * Body: { "urls": ["https://a.com", "https://b.com", ...], "refresh": false }
 *
 * Response: Array of results, each with success/error status.
 */
export async function POST(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    // Parse and validate
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON body");
    }

    const parsed = batchPreviewRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.errors[0]?.message ?? "Invalid input",
        { errors: parsed.error.flatten().fieldErrors }
      );
    }

    const { urls, refresh } = parsed.data;

    // Check rate limit for the entire batch
    const rateLimit = await checkRateLimit(ctx.apiKeyId, ctx.plan);
    if (!rateLimit.allowed) {
      const { RateLimitError } = await import("@/lib/api/api-error");
      throw new RateLimitError(rateLimit.limit, rateLimit.remaining, rateLimit.resetAt);
    }

    // Check if batch would exceed remaining quota
    if (rateLimit.remaining < urls.length) {
      throw new ValidationError(
        `Batch of ${urls.length} URLs would exceed your remaining quota of ${rateLimit.remaining} requests today`
      );
    }

    // Process URLs with concurrency limit
    const results = await processWithConcurrency(
      urls,
      async (url) => {
        try {
          const result = await generatePreview(url, ctx.userId, { refresh });
          return {
            url,
            success: true as const,
            data: result.data,
            cached: result.cached,
            engine: result.engine,
            responseTime: result.responseTime,
          };
        } catch (error) {
          return {
            url,
            success: false as const,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      PREVIEW_LIMITS.batchConcurrency
    );

    const response = successResponse(
      {
        results,
        summary: {
          total: results.length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      },
      { requestId: ctx.requestId }
    );

    return withRateLimitHeaders(
      response,
      rateLimit.limit,
      Math.max(0, rateLimit.remaining - urls.length),
      rateLimit.resetAt
    );
  });
}

/**
 * Process items with a concurrency limit using Promise.allSettled pattern.
 */
async function processWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  const executing: Set<Promise<void>> = new Set();

  for (const item of items) {
    const promise = fn(item).then((result) => {
      results.push(result);
    });

    const wrappedPromise = promise.then(() => {
      executing.delete(wrappedPromise);
    });

    executing.add(wrappedPromise);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
