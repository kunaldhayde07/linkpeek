"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/auth/supabase/server";
import { getOrCreateUser } from "@/lib/auth/auth.service";
import { previewRequestSchema } from "@/lib/preview";
import { generatePreview, deletePreview } from "@/lib/preview/preview.service";
import { logger } from "@/lib/utils";

import type { PreviewData } from "@/lib/preview/preview.types";

// ============================================================================
// Preview Server Actions
// Used by the dashboard UI (not the API — API uses route handlers)
// ============================================================================

export interface PreviewActionResult {
  success: boolean;
  data?: PreviewData;
  error?: string;
  cached?: boolean;
  engine?: string;
  responseTime?: number;
}

/**
 * Generate a preview from the dashboard UI.
 */
export async function generatePreviewAction(formData: FormData): Promise<PreviewActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const rawData = {
    url: formData.get("url") as string,
    refresh: formData.get("refresh") === "true",
  };

  const parsed = previewRequestSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid URL" };
  }

  try {
    // Ensure user profile exists
    await getOrCreateUser(user.id, user.email!, user.user_metadata?.name as string);

    const result = await generatePreview(parsed.data.url, user.id, {
      refresh: parsed.data.refresh,
    });

    revalidatePath("/dashboard");
    revalidatePath("/history");

    return {
      success: true,
      data: result.data,
      cached: result.cached,
      engine: result.engine,
      responseTime: result.responseTime,
    };
  } catch (error) {
    logger.error("Preview action failed", {
      url: parsed.data.url,
      error: error instanceof Error ? error.message : "Unknown",
    });

    const message = error instanceof Error ? error.message : "Failed to generate preview";
    return { success: false, error: message };
  }
}

/**
 * Delete a preview from the dashboard.
 */
export async function deletePreviewAction(previewId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const deleted = await deletePreview(previewId, user.id);

    if (!deleted) {
      return { success: false, error: "Preview not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/history");

    return { success: true };
  } catch (error) {
    logger.error("Delete preview action failed", {
      previewId,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: false, error: "Failed to delete preview" };
  }
}
