import { NextResponse } from "next/server";

import { cacheHealthCheck } from "@/lib/cache";
import { prisma } from "@/lib/db";

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Returns the health status of all system components.
 * Used by uptime monitors and deployment verification.
 */
export async function GET() {
  const checks: Record<string, { status: string; latency?: number }> = {};
  let overallStatus = "healthy";

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks["database"] = { status: "connected", latency: Date.now() - dbStart };
  } catch {
    checks["database"] = { status: "error" };
    overallStatus = "degraded";
  }

  // Check Redis
  const redisHealth = await cacheHealthCheck();
  checks["redis"] = redisHealth;
  if (redisHealth.status !== "connected") {
    overallStatus = "degraded";
  }

  const statusCode = overallStatus === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      checks,
    },
    { status: statusCode }
  );
}
