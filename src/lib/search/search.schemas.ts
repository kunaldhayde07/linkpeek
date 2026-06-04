import { z } from "zod";

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(200, "Search query too long").trim(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  tagIds: z.array(z.string().uuid()).optional(),
  collectionId: z.string().uuid().optional(),
});

export type SearchInput = z.infer<typeof searchSchema>;
