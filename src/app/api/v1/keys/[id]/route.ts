import { type NextRequest } from "next/server";

import { createApiKey, listApiKeys } from "@/lib/auth/api-key.service";
import { createApiKeySchema } from "@/lib/auth/auth.schemas";
import {
  successResponse,
  AppError,
  ValidationError,
} from "@/lib/api";
import { withSessionOrApiAuth } from "@/lib/api/api-middleware";
import { MAX_API_KEYS_PER_USER } from "@/lib/utils";

/**
 * GET /api/v1/keys
 * List all API keys for the authenticated user.
 *
 * Auth: Supabase session (dashboard) OR API key (programmatic)
 */
export async function GET(request: NextRequest) {
  return withSessionOrApiAuth(request, async (ctx) => {
    const keys = await listApiKeys(ctx.userId);
    return successResponse(keys, { requestId: ctx.requestId });
  });
}

/**
 * POST /api/v1/keys
 * Generate a new API key.
 *
 * Auth: Supabase session (dashboard) OR API key (programmatic)
 * Body: { name?: string }
 * Returns the raw key (shown once) + metadata.
 */
export async function POST(request: NextRequest) {
  return withSessionOrApiAuth(request, async (ctx) => {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // Validate input
    const parsed = createApiKeySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.errors[0]?.message ?? "Invalid input",
        { errors: parsed.error.flatten().fieldErrors }
      );
    }

    // Create the key
    try {
      const createdKey = await createApiKey(ctx.userId, parsed.data.name);

      return successResponse(
        {
          id: createdKey.id,
          name: createdKey.name,
          key: createdKey.rawKey, // Shown ONCE
          keyPrefix: createdKey.keyPrefix,
          createdAt: createdKey.createdAt,
        },
        { requestId: ctx.requestId },
        201
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("Maximum")) {
        throw new AppError(
          `Maximum of ${MAX_API_KEYS_PER_USER} active API keys reached. Revoke an existing key first.`,
          400,
          "KEY_LIMIT_EXCEEDED"
        );
      }
      throw error;
    }
  });
}

/**
 * Handle CORS preflight requests.
 */
export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
