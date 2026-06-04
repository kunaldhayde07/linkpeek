import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters").trim(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default("#6366f1"),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const tagPreviewSchema = z.object({
  previewId: z.string().uuid("Invalid preview ID"),
  tagId: z.string().uuid("Invalid tag ID"),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
