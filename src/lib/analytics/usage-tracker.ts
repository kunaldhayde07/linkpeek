import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils";

// ============================================================================
// Usage Tracker
//
// Records every API request in the api_usage table for analytics.
// Called asynchronously after the response is sent (non-blocking).
// ============================================================================

export interface UsageEvent {
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  url?: string;
  cached?: boolean;
  engine?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Track an API usage event.
 * This is fire-and-forget — failures are logged but don't affect the response.
 */
export async function trackUsage(event: UsageEvent): Promise<void> {
  try {
    await prisma.apiUsage.create({
      data: {
        apiKeyId: event.apiKeyId,
        endpoint: event.endpoint,
        method: event.method,
        statusCode: event.statusCode,
        responseTime: event.responseTime,
        url: event.url ?? null,
        cached: event.cached ?? false,
        engine: event.engine ?? null,
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ? event.userAgent.substring(0, 1024) : null,
      },
    });
  } catch (error) {
    // Non-critical — log and continue
    logger.warn("Failed to track API usage", {
      endpoint: event.endpoint,
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
}
