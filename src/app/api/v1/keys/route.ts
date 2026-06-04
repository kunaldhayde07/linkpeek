import { type NextRequest } from "next/server";

import { revokeApiKey } from "@/lib/auth/api-key.service";
import { successResponse, NotFoundError } from "@/lib/api";
import { withSessionOrApiAuth } from "@/lib/api/api-middleware";

/**
 * DELETE /api/v1/keys/:id
 * Revoke (soft-delete) an API key.
 *
 * Auth: Supabase session (dashboard) OR API key (programmatic)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSessionOrApiAuth(request, async (ctx) => {
    const { id } = await params;

    try {
      await revokeApiKey(id, ctx.userId);

      return successResponse(
        { message: "API key revoked successfully" },
        { requestId: ctx.requestId }
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          throw new NotFoundError("API key");
        }
        if (error.message.includes("already revoked")) {
          return successResponse(
            { message: "API key is already revoked" },
            { requestId: ctx.requestId }
          );
        }
      }
      throw error;
    }
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
