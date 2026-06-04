"use server";

import { createClient } from "@/lib/auth/supabase/server";
import { exportPreviews } from "@/lib/export/export.service";
import { logger } from "@/lib/utils";

import type { ExportFormat } from "@/lib/export/export.types";

export interface ExportActionResult {
  success: boolean;
  error?: string;
  content?: string;
  filename?: string;
  contentType?: string;
}

/**
 * Export preview data as JSON or CSV from the dashboard.
 */
export async function exportDataAction(format: ExportFormat): Promise<ExportActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const result = await exportPreviews(user.id, { format });

    return {
      success: true,
      content: result.content,
      filename: result.filename,
      contentType: result.contentType,
    };
  } catch (error) {
    logger.error("Export action failed", {
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: false, error: "Failed to export data" };
  }
}
