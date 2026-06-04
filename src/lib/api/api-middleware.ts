import { type NextRequest } from "next/server";

import { validateApiKey } from "@/lib/auth/api-key.service";
import { generateRequestId, logger } from "@/lib/utils";

import { AuthenticationError } from "./api-error";
import { errorResponse } from "./api-response";
import type { ApiContext } from "./api.types";

// ============================================================================
// API Middleware
// Authenticates API requests and builds the request context.
// Used by all /api/v1/* route handlers.
// ============================================================================

/**
 * Extract and validate the API key from the Authorization header.
 * Returns the authenticated context or throws an error.
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<ApiContext> {
  const requestId = generateRequestId();
  const startTime = performance.now();

  // Extract Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    throw new AuthenticationError(
      "Missing Authorization header. Use: Authorization: Bearer <your_api_key>",
      "MISSING_API_KEY"
    );
  }

  // Parse Bearer token
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer" || !parts[1]) {
    throw new AuthenticationError(
      "Invalid Authorization header format. Use: Authorization: Bearer <your_api_key>",
      "INVALID_API_KEY"
    );
  }

  const rawKey = parts[1];

  // Validate the API key
  const validation = await validateApiKey(rawKey);

  if (!validation.valid) {
    throw new AuthenticationError(
      validation.error ?? "Invalid API key",
      "INVALID_API_KEY"
    );
  }

  logger.debug("API request authenticated via API key", {
    requestId,
    userId: validation.userId,
    apiKeyId: validation.apiKeyId,
    plan: validation.plan,
  });

  return {
    requestId,
    userId: validation.userId!,
    apiKeyId: validation.apiKeyId!,
    plan: validation.plan!,
    startTime,
  };
}

/**
 * Authenticate via Supabase session cookie.
 * Also ensures the user profile exists in our database (creates if missing).
 * Returns the authenticated context or null if not authenticated.
 */
async function authenticateViaSession(): Promise<ApiContext | null> {
  try {
    const { createClient } = await import("@/lib/auth/supabase/server");
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Ensure user profile exists in our database.
    // This handles the case where a user signed up via OAuth or the profile
    // wasn't created yet when they navigate directly to the API keys page.
    const { getOrCreateUser } = await import("@/lib/auth/auth.service");
    const profile = await getOrCreateUser(
      user.id,
      user.email!,
      (user.user_metadata?.name as string) ?? (user.user_metadata?.full_name as string) ?? null,
      (user.user_metadata?.avatar_url as string) ?? null
    );

    return {
      requestId: generateRequestId(),
      userId: user.id,
      apiKeyId: "session", // Dashboard session, not an API key
      plan: profile.plan,
      startTime: performance.now(),
    };
  } catch (err) {
    logger.error("Session authentication failed", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return null;
  }
}

/**
 * Wrapper that handles authentication and error handling for API routes.
 * Authenticates via API key (Bearer token) only.
 *
 * Use this for public API endpoints consumed by third-party apps.
 */
export async function withApiAuth(
  request: NextRequest,
  handler: (ctx: ApiContext) => Promise<Response>
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const ctx = await authenticateApiRequest(request);
    return await handler(ctx);
  } catch (error) {
    return errorResponse(error, requestId);
  }
}

/**
 * Wrapper that accepts EITHER Supabase session (dashboard) OR API key (programmatic).
 *
 * Authentication priority:
 * 1. If Authorization header is present → validate as API key
 * 2. If no Authorization header → try Supabase session cookie
 * 3. If neither → return 401
 *
 * Use this for endpoints that are called from both the dashboard UI
 * (via fetch with cookies) and external API consumers (via Bearer token).
 */
export async function withSessionOrApiAuth(
  request: NextRequest,
  handler: (ctx: ApiContext) => Promise<Response>
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader) {
      // Has Authorization header → authenticate via API key
      const ctx = await authenticateApiRequest(request);
      return await handler(ctx);
    }

    // No Authorization header → try Supabase session
    const sessionCtx = await authenticateViaSession();

    if (sessionCtx) {
      return await handler(sessionCtx);
    }

    // Neither method worked
    throw new AuthenticationError(
      "Authentication required. Provide an API key via Authorization header or sign in via the dashboard.",
      "MISSING_API_KEY"
    );
  } catch (error) {
    return errorResponse(error, requestId);
  }
}

/**
 * Get the authenticated user from a Supabase session (for dashboard routes).
 * This is used by Server Components and Server Actions, not API routes.
 */
export async function getSessionUser() {
  const { createClient } = await import("@/lib/auth/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
