// ============================================================================
// Test Helpers
// Common utilities for test files
// ============================================================================

import type { ApiSuccessResponse, ApiErrorResponse } from "@/lib/api";

/**
 * Create a mock NextRequest object for API route testing.
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  } = {}
): Request {
  const { method = "GET", body, headers = {} } = options;

  return new Request(`http://localhost:3000${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Parse a NextResponse body as JSON.
 */
export async function parseResponse<T>(
  response: Response
): Promise<ApiSuccessResponse<T> | ApiErrorResponse> {
  return response.json();
}

/**
 * Assert that a response is a success response.
 */
export function assertSuccess<T>(
  response: ApiSuccessResponse<T> | ApiErrorResponse
): asserts response is ApiSuccessResponse<T> {
  if (!response.success) {
    throw new Error(`Expected success response, got error: ${response.error?.message}`);
  }
}

/**
 * Assert that a response is an error response.
 */
export function assertError(
  response: ApiSuccessResponse<unknown> | ApiErrorResponse
): asserts response is ApiErrorResponse {
  if (response.success) {
    throw new Error("Expected error response, got success");
  }
}

/**
 * Wait for a specified number of milliseconds.
 * Useful for testing debounced operations.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
