import { type NextRequest } from "next/server";

import { successResponse, ValidationError, NotFoundError } from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { updateTagSchema } from "@/lib/tag";
import { updateTag, deleteTag } from "@/lib/tag/tag.service";

/**
 * PUT /api/v1/tags/:id
 * Update a tag's name or color.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, async (ctx) => {
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON body");
    }

    const parsed = updateTagSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message ?? "Invalid input");
    }

    try {
      const updated = await updateTag(id, ctx.userId, parsed.data);
      return successResponse(updated, { requestId: ctx.requestId });
    } catch {
      throw new NotFoundError("Tag");
    }
  });
}

/**
 * DELETE /api/v1/tags/:id
 * Delete a tag.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, async (ctx) => {
    const { id } = await params;
    const deleted = await deleteTag(id, ctx.userId);

    if (!deleted) {
      throw new NotFoundError("Tag");
    }

    return successResponse(
      { message: "Tag deleted successfully" },
      { requestId: ctx.requestId }
    );
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
