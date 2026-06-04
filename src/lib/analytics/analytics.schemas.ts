import { z } from "zod";

export const analyticsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  apiKeyId: z.string().uuid().optional(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
