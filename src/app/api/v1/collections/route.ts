import { type NextRequest } from "next/server";

import { successResponse, ValidationError, DuplicateError } from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { createCollectionSchema } from "@/lib/collection";
import { listCollections, createCollection } from "@/lib/collection/collection.service";

/**
 * GET /api/v1/collections
 * List all collections for the authenticated user.
 */
export async function GET(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    const collections = await listCollections(ctx.userId);
    return successResponse(collections, { requestId: ctx.requestId });
  });
}

/**
 * POST /api/v1/collections
 * Create a new collection.
 *
 * Body: { "name": "My Collection", "description": "Optional description" }
 */
export async function POST(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON body");
    }

    const parsed = createCollectionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.errors[0]?.message ?? "Invalid input"
      );
    }

    try {
      const collection = await createCollection(ctx.userId, parsed.data);
      return successResponse(collection, { requestId: ctx.requestId }, 201);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        throw new DuplicateError("Collection with this name");
      }
      throw error;
    }
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
