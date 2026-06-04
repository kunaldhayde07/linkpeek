import { type NextRequest } from "next/server";

import { successResponse, ValidationError, NotFoundError } from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { addPreviewToCollectionSchema } from "@/lib/collection";
import {
  addPreviewToCollection,
  removePreviewFromCollection,
} from "@/lib/collection/collection.service";

/**
 * POST /api/v1/collections/:id/previews
 * Add a preview to a collection.
 *
 * Body: { "previewId": "uuid" }
 */
export async function POST(
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

    const parsed = addPreviewToCollectionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message ?? "Invalid input");
    }

    try {
      await addPreviewToCollection(id, parsed.data.previewId, ctx.userId);
      return successResponse(
        { message: "Preview added to collection" },
        { requestId: ctx.requestId },
        201
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          throw new NotFoundError(error.message.split(" ")[0]);
        }
      }
      throw error;
    }
  });
}

/**
 * DELETE /api/v1/collections/:id/previews
 * Remove a preview from a collection.
 *
 * Body: { "previewId": "uuid" }
 */
export async function DELETE(
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

    const parsed = addPreviewToCollectionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message ?? "Invalid input");
    }

    try {
      await removePreviewFromCollection(id, parsed.data.previewId, ctx.userId);
      return successResponse(
        { message: "Preview removed from collection" },
        { requestId: ctx.requestId }
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new NotFoundError("Collection");
      }
      throw error;
    }
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
