import { NextResponse } from "next/server";

import type { ErrorCode } from "./api-error";
import { isAppError } from "./api-error";

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponseMeta {
  requestId: string;
  timestamp: string;
  cached?: boolean;
  responseTime?: number;
  engine?: "fetch" | "playwright";
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
  error: null;
}

export interface ApiErrorDetail {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  meta: ApiResponseMeta;
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Response Builders
// ============================================================================

/**
 * Build a successful API response.
 */
export function successResponse<T>(
  data: T,
  meta: Partial<ApiResponseMeta> & { requestId: string },
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
      error: null,
    },
    { status }
  );
}

/**
 * Build an error API response.
 */
export function errorResponse(
  error: unknown,
  requestId: string
): NextResponse<ApiErrorResponse> {
  if (isAppError(error)) {
    const response = NextResponse.json(
      {
        success: false as const,
        data: null,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
        },
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );

    // Add rate limit headers for 429 responses
    if (error.statusCode === 429 && error.details) {
      const details = error.details as { limit?: number; remaining?: number; resetAt?: number };
      if (details.resetAt) {
        const retryAfter = Math.max(0, details.resetAt - Math.floor(Date.now() / 1000));
        response.headers.set("Retry-After", String(retryAfter));
      }
      if (details.limit !== undefined) {
        response.headers.set("X-RateLimit-Limit", String(details.limit));
      }
      if (details.remaining !== undefined) {
        response.headers.set("X-RateLimit-Remaining", String(details.remaining));
      }
      if (details.resetAt !== undefined) {
        response.headers.set("X-RateLimit-Reset", String(details.resetAt));
      }
    }

    return response;
  }

  // Unexpected errors
  console.error("Unhandled error:", error);

  return NextResponse.json(
    {
      success: false as const,
      data: null,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
      error: {
        code: "INTERNAL_ERROR" as ErrorCode,
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}

/**
 * Add rate limit headers to any response.
 */
export function withRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetAt: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(resetAt));
  return response;
}
