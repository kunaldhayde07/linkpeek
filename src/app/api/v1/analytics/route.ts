import { type NextRequest } from "next/server";

import { successResponse, ValidationError } from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { analyticsQuerySchema } from "@/lib/analytics";
import { getAnalytics } from "@/lib/analytics/analytics.service";

/**
 * GET /api/v1/analytics
 *
 * Get API usage analytics for the authenticated user.
 *
 * Query Params:
 *   - startDate: ISO date string (default: 7 days ago)
 *   - endDate: ISO date string (default: now)
 *   - apiKeyId: filter by specific API key (optional)
 */
export async function GET(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    const { searchParams } = new URL(request.url);

    const rawParams = {
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      apiKeyId: searchParams.get("apiKeyId") ?? undefined,
    };

    const parsed = analyticsQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.errors[0]?.message ?? "Invalid query parameters"
      );
    }

    const analytics = await getAnalytics(
      ctx.userId,
      parsed.data.startDate,
      parsed.data.endDate
    );

    return successResponse(analytics, { requestId: ctx.requestId });
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
