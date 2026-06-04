import { type NextRequest } from "next/server";

import { successResponse, ValidationError, NotFoundError } from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { updateCollectionSchema } from "@/lib/collection";
import {
  getCollection,
  updateCollection,
  deleteCollection,
} from "@/lib/collection/collection.service";

/**
 * GET /api/v1/collections/:id
 * Get a collection with its previews.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, async (ctx) => {
    const { id } = await params;
    const collection = await getCollection(id, ctx.userId);

    if (!collection) {
      throw new NotFoundError("Collection");
    }

    return successResponse(collection, { requestId: ctx.requestId });
  });
}

/**
 * PUT /api/v1/collections/:id
 * Update a collection's name or description.
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

    const parsed = updateCollectionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message ?? "Invalid input");
    }

    try {
      const updated = await updateCollection(id, ctx.userId, parsed.data);
      return successResponse(updated, { requestId: ctx.requestId });
    } catch {
      throw new NotFoundError("Collection");
    }
  });
}

/**
 * DELETE /api/v1/collections/:id
 * Delete a collection.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, async (ctx) => {
    const { id } = await params;
    const deleted = await deleteCollection(id, ctx.userId);

    if (!deleted) {
      throw new NotFoundError("Collection");
    }

    return successResponse(
      { message: "Collection deleted successfully" },
      { requestId: ctx.requestId }
    );
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
