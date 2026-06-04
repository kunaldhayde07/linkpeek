import { type NextRequest } from "next/server";

import { successResponse, ValidationError } from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { previewListSchema } from "@/lib/preview";
import { listPreviews } from "@/lib/preview/preview.service";

/**
 * GET /api/v1/previews
 * List the authenticated user's preview history (paginated).
 *
 * Query Params:
 *   - page: number (default 1)
 *   - limit: number (default 20, max 100)
 *   - domain: string (optional filter)
 *   - tagId: string (optional filter)
 */
export async function GET(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    const { searchParams } = new URL(request.url);

    const rawParams = {
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      domain: searchParams.get("domain") ?? undefined,
      tagId: searchParams.get("tagId") ?? undefined,
    };

    const parsed = previewListSchema.safeParse(rawParams);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.errors[0]?.message ?? "Invalid query parameters"
      );
    }

    const { page, limit, domain, tagId } = parsed.data;

    const result = await listPreviews(ctx.userId, page, limit, {
      domain: domain ?? undefined,
      tagId: tagId ?? undefined,
    });

    return successResponse(result, { requestId: ctx.requestId });
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
