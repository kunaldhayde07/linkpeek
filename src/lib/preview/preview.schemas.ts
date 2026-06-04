import { z } from "zod";

import { PREVIEW_LIMITS, VIEWPORT_PRESETS } from "@/lib/utils";

// ============================================================================
// Preview Zod Schemas
// ============================================================================

/** Schema for single preview request */
export const previewRequestSchema = z.object({
  url: z
    .string({ required_error: "URL is required" })
    .url("Must be a valid URL")
    .max(PREVIEW_LIMITS.maxUrlLength, `URL must be less than ${PREVIEW_LIMITS.maxUrlLength} characters`)
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ["http:", "https:"].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: "Only HTTP and HTTPS URLs are allowed" }
    ),
  refresh: z.boolean().optional().default(false),
});

/** Schema for batch preview request */
export const batchPreviewRequestSchema = z.object({
  urls: z
    .array(z.string().url().max(PREVIEW_LIMITS.maxUrlLength))
    .min(1, "At least one URL is required")
    .max(PREVIEW_LIMITS.batchMaxUrls, `Maximum ${PREVIEW_LIMITS.batchMaxUrls} URLs per batch`),
  refresh: z.boolean().optional().default(false),
});

/** Schema for screenshot request */
export const screenshotRequestSchema = z.object({
  url: z
    .string({ required_error: "URL is required" })
    .url("Must be a valid URL")
    .max(PREVIEW_LIMITS.maxUrlLength),
  viewport: z
    .object({
      width: z.number().int().min(320).max(3840).default(VIEWPORT_PRESETS.desktop.width),
      height: z.number().int().min(240).max(2160).default(VIEWPORT_PRESETS.desktop.height),
    })
    .optional()
    .default(VIEWPORT_PRESETS.desktop),
  format: z.enum(["png", "jpeg", "webp"]).optional().default("png"),
  fullPage: z.boolean().optional().default(false),
});

/** Schema for preview list query params */
export const previewListSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  domain: z.string().optional(),
  tagId: z.string().uuid().optional(),
  collectionId: z.string().uuid().optional(),
});

export type PreviewRequest = z.infer<typeof previewRequestSchema>;
export type BatchPreviewRequest = z.infer<typeof batchPreviewRequestSchema>;
export type ScreenshotRequest = z.infer<typeof screenshotRequestSchema>;
export type PreviewListParams = z.infer<typeof previewListSchema>;
