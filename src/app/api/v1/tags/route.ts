import { type NextRequest } from "next/server";

import { successResponse, ValidationError, DuplicateError } from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { createTagSchema } from "@/lib/tag";
import { listTags, createTag } from "@/lib/tag/tag.service";

/**
 * GET /api/v1/tags
 * List all tags for the authenticated user.
 */
export async function GET(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    const tags = await listTags(ctx.userId);
    return successResponse(tags, { requestId: ctx.requestId });
  });
}

/**
 * POST /api/v1/tags
 * Create a new tag.
 *
 * Body: { "name": "frontend", "color": "#6366f1" }
 */
export async function POST(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON body");
    }

    const parsed = createTagSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message ?? "Invalid input");
    }

    try {
      const tag = await createTag(ctx.userId, parsed.data);
      return successResponse(tag, { requestId: ctx.requestId }, 201);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        throw new DuplicateError("Tag with this name");
      }
      throw error;
    }
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
