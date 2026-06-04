import { type NextRequest } from "next/server";

import {
  successResponse,
  ValidationError,
  FetchError,
  InvalidUrlError,
  withRateLimitHeaders,
  AppError,
} from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { screenshotRequestSchema } from "@/lib/preview";
import { generateScreenshot } from "@/lib/preview/screenshot.service";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";

/**
 * POST /api/v1/screenshot
 *
 * Capture a screenshot of a URL.
 *
 * Request Body:
 *   {
 *     "url": "https://example.com",
 *     "viewport": { "width": 1280, "height": 720 },
 *     "format": "png",
 *     "fullPage": false
 *   }
 *
 * Response:
 *   { "success": true, "data": { screenshotUrl, viewportWidth, viewportHeight, fileSize, format } }
 */
export async function POST(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    // Rate limiting
    const rateLimit = await checkRateLimit(ctx.apiKeyId, ctx.plan);
    if (!rateLimit.allowed) {
      const { RateLimitError } = await import("@/lib/api/api-error");
      throw new RateLimitError(rateLimit.limit, rateLimit.remaining, rateLimit.resetAt);
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON body");
    }

    const parsed = screenshotRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.errors[0]?.message ?? "Invalid input",
        { errors: parsed.error.flatten().fieldErrors }
      );
    }

    const { url, viewport, format, fullPage } = parsed.data;

    try {
      const result = await generateScreenshot(url, ctx.userId, {
        viewport,
        format,
        fullPage,
      });

      const response = successResponse(result, {
        requestId: ctx.requestId,
      });

      return withRateLimitHeaders(
        response,
        rateLimit.limit,
        rateLimit.remaining,
        rateLimit.resetAt
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not allowed") || error.message.includes("blocked")) {
          throw new InvalidUrlError(error.message);
        }
        if (error.message.includes("failed") || error.message.includes("timeout")) {
          throw new AppError(error.message, 422, "SCREENSHOT_ERROR");
        }
      }
      throw error;
    }
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
