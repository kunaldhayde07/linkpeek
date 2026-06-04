"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/auth/supabase/server";
import { getOrCreateUser } from "@/lib/auth/auth.service";
import {
  createApiKey,
  revokeApiKey,
  listApiKeys,
} from "@/lib/auth/api-key.service";
import { createApiKeySchema } from "@/lib/auth/auth.schemas";
import { MAX_API_KEYS_PER_USER, logger } from "@/lib/utils";

import type { ApiKeyDisplay, CreatedApiKey } from "@/lib/auth/auth.types";

// ============================================================================
// API Key Server Actions
// Called from the dashboard UI — uses Supabase session cookies for auth.
// ============================================================================

export interface ApiKeyActionResult {
  success: boolean;
  error?: string;
  data?: CreatedApiKey;
}

/**
 * Create a new API key from the dashboard.
 */
export async function createApiKeyAction(name?: string): Promise<ApiKeyActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated. Please sign in again." };
  }

  // Validate name if provided
  if (name !== undefined) {
    const parsed = createApiKeySchema.safeParse({ name });
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }
  }

  try {
    // Ensure user profile exists in our DB
    await getOrCreateUser(
      user.id,
      user.email!,
      (user.user_metadata?.name as string) ?? null,
      (user.user_metadata?.avatar_url as string) ?? null
    );

    const createdKey = await createApiKey(user.id, name);

    revalidatePath("/api-keys");

    return { success: true, data: createdKey };
  } catch (error) {
    logger.error("Create API key action failed", {
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown",
    });

    if (error instanceof Error && error.message.includes("Maximum")) {
      return {
        success: false,
        error: `Maximum of ${MAX_API_KEYS_PER_USER} active API keys. Revoke an existing key first.`,
      };
    }

    return { success: false, error: "Failed to create API key. Please try again." };
  }
}

/**
 * Revoke an API key from the dashboard.
 */
export async function revokeApiKeyAction(keyId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await revokeApiKey(keyId, user.id);
    revalidatePath("/api-keys");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return { success: false, error: "API key not found" };
      }
      if (error.message.includes("already revoked")) {
        return { success: true }; // Already revoked, treat as success
      }
    }
    return { success: false, error: "Failed to revoke API key" };
  }
}
