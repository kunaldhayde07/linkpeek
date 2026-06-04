import { prisma } from "@/lib/db";
import { CACHE_TTL, VIEWPORT_PRESETS, logger } from "@/lib/utils";

import { captureScreenshot } from "./playwright-engine";
import type { ScreenshotResult } from "./preview.types";
import { hashUrl, extractDomain } from "./url-normalizer";
import { validateUrl } from "./url-validator";

// ============================================================================
// Screenshot Service
//
// Captures viewport screenshots of URLs using Playwright.
// Screenshots are stored in Supabase Storage and metadata is persisted in DB.
//
// Caching: Screenshots are cached by URL hash + viewport dimensions.
// A cached screenshot is returned if one exists for the same URL + viewport.
// ============================================================================

/**
 * Generate a screenshot for a URL.
 *
 * Pipeline:
 * 1. Validate URL
 * 2. Check if screenshot already exists for this URL + viewport
 * 3. Capture screenshot with Playwright
 * 4. Upload to Supabase Storage
 * 5. Persist metadata in DB
 * 6. Return public URL
 */
export async function generateScreenshot(
  url: string,
  userId: string,
  options: {
    viewport?: { width: number; height: number };
    format?: "png" | "jpeg" | "webp";
    fullPage?: boolean;
    previewId?: string;
  } = {}
): Promise<ScreenshotResult> {
  const viewport = options.viewport ?? VIEWPORT_PRESETS.desktop;
  const format = options.format ?? "png";

  // Step 1: Validate URL
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(validation.error ?? "Invalid URL");
  }

  const urlHash = hashUrl(url);

  // Step 2: Check for existing screenshot
  const existing = await prisma.screenshot.findFirst({
    where: {
      urlHash,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      userId,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    logger.debug("Returning cached screenshot", { url, viewport });
    return {
      screenshotUrl: existing.publicUrl,
      storagePath: existing.storagePath,
      viewportWidth: existing.viewportWidth,
      viewportHeight: existing.viewportHeight,
      fileSize: existing.fileSize ?? 0,
      format: existing.format,
    };
  }

  // Step 3: Capture screenshot
  const buffer = await captureScreenshot(url, viewport, {
    fullPage: options.fullPage,
  });

  // Step 4: Upload to Supabase Storage
  const storagePath = `screenshots/${userId}/${urlHash}_${viewport.width}x${viewport.height}.${format}`;
  let publicUrl: string;

  try {
    const { createServiceClient } = await import("@/lib/auth/supabase/server");
    const supabase = createServiceClient();

    const { error: uploadError } = await supabase.storage
      .from("screenshots")
      .upload(storagePath, buffer, {
        contentType: `image/${format}`,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("screenshots")
      .getPublicUrl(storagePath);

    publicUrl = urlData.publicUrl;
  } catch (error) {
    logger.error("Screenshot upload failed", {
      url,
      error: error instanceof Error ? error.message : "Unknown",
    });
    throw new Error("Failed to upload screenshot to storage");
  }

  // Step 5: Persist metadata in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

  try {
    await prisma.screenshot.create({
      data: {
        userId,
        previewId: options.previewId ?? null,
        url,
        urlHash,
        storagePath,
        publicUrl,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        fileSize: buffer.byteLength,
        format,
        expiresAt,
      },
    });
  } catch (error) {
    logger.warn("Failed to persist screenshot metadata", {
      error: error instanceof Error ? error.message : "Unknown",
    });
    // Non-critical — screenshot is already uploaded
  }

  logger.info("Screenshot generated", {
    url,
    viewport,
    fileSize: buffer.byteLength,
    format,
  });

  return {
    screenshotUrl: publicUrl,
    storagePath,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    fileSize: buffer.byteLength,
    format,
  };
}
