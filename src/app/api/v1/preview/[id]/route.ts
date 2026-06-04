import { type NextRequest } from "next/server";

import { successResponse, NotFoundError } from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { getPreviewById, deletePreview } from "@/lib/preview/preview.service";

/**
 * GET /api/v1/preview/:id
 * Get a specific preview by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, async (ctx) => {
    const { id } = await params;

    const preview = await getPreviewById(id, ctx.userId);

    if (!preview) {
      throw new NotFoundError("Preview");
    }

    return successResponse(preview, { requestId: ctx.requestId });
  });
}

/**
 * DELETE /api/v1/preview/:id
 * Delete a specific preview.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, async (ctx) => {
    const { id } = await params;

    const deleted = await deletePreview(id, ctx.userId);

    if (!deleted) {
      throw new NotFoundError("Preview");
    }

    return successResponse(
      { message: "Preview deleted successfully" },
      { requestId: ctx.requestId }
    );
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
