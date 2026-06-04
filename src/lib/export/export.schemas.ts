import { z } from "zod";

export const exportRequestSchema = z.object({
  format: z.enum(["json", "csv"]),
  collectionId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type ExportRequest = z.infer<typeof exportRequestSchema>;
