import { type NextRequest } from "next/server";

import {
  successResponse,
  errorResponse,
  ValidationError,
  FetchError,
  InvalidUrlError,
  withRateLimitHeaders,
} from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { previewRequestSchema } from "@/lib/preview";
import { generatePreview } from "@/lib/preview/preview.service";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";

/**
 * POST /api/v1/preview
 *
 * Generate a link preview for a single URL.
 *
 * Request Body:
 *   { "url": "https://example.com", "refresh": false }
 *
 * Response:
 *   { "success": true, "data": { title, description, image, ... }, "meta": { cached, engine, responseTime } }
 *
 * Authentication: Bearer API key required.
 * Rate Limited: Per API key, per day.
 */
export async function POST(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    // Rate limiting
    const rateLimit = await checkRateLimit(ctx.apiKeyId, ctx.plan);
    if (!rateLimit.allowed) {
      const response = errorResponse(
        new (await import("@/lib/api/api-error")).RateLimitError(
          rateLimit.limit,
          rateLimit.remaining,
          rateLimit.resetAt
        ),
        ctx.requestId
      );
      return response;
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON body");
    }

    const parsed = previewRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      if (firstError?.path.includes("url")) {
        throw new InvalidUrlError(firstError.message);
      }
      throw new ValidationError(
        firstError?.message ?? "Invalid input",
        { errors: parsed.error.flatten().fieldErrors }
      );
    }

    const { url, refresh } = parsed.data;

    // Generate preview
    try {
      const result = await generatePreview(url, ctx.userId, { refresh });

      const response = successResponse(result.data, {
        requestId: ctx.requestId,
        cached: result.cached,
        engine: result.engine,
        responseTime: result.responseTime,
      });

      // Add rate limit headers
      return withRateLimitHeaders(
        response,
        rateLimit.limit,
        rateLimit.remaining,
        rateLimit.resetAt
      );
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("timed out") ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("HTTP ")
        ) {
          throw new FetchError(error.message, url);
        }
        if (error.message.includes("not allowed") || error.message.includes("blocked")) {
          throw new InvalidUrlError(error.message);
        }
      }
      throw error;
    }
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
