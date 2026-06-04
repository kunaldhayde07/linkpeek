import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").trim(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional().nullable(),
});

export const addPreviewToCollectionSchema = z.object({
  previewId: z.string().uuid("Invalid preview ID"),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
