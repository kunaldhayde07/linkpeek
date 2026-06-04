import { type NextRequest } from "next/server";

import { successResponse, ValidationError } from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { searchSchema } from "@/lib/search";
import { searchPreviews } from "@/lib/search/search.service";

/**
 * GET /api/v1/search
 *
 * Full-text search across the user's preview history.
 *
 * Query Params:
 *   - q: search query (required)
 *   - page: page number (default 1)
 *   - limit: results per page (default 20, max 100)
 */
export async function GET(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    const { searchParams } = new URL(request.url);

    const rawParams = {
      q: searchParams.get("q") ?? "",
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };

    const parsed = searchSchema.safeParse(rawParams);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.errors[0]?.message ?? "Invalid query parameters"
      );
    }

    const results = await searchPreviews(
      ctx.userId,
      parsed.data.q,
      parsed.data.page,
      parsed.data.limit
    );

    return successResponse(results, { requestId: ctx.requestId });
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
