import { createHash } from "crypto";

import { TRACKING_PARAMS } from "@/lib/utils";

// ============================================================================
// URL Normalizer
//
// Normalizes URLs before caching to ensure semantically identical URLs
// produce the same cache key. This prevents redundant fetches.
//
// Example:
//   "HTTPS://WWW.Example.COM/path/?b=2&a=1#section"
//   → "https://www.example.com/path?a=1&b=2"
//
// Both produce the same SHA-256 cache key.
// ============================================================================

/**
 * Normalize a URL for consistent cache key generation.
 *
 * Steps:
 * 1. Lowercase protocol and hostname
 * 2. Remove default ports (80, 443)
 * 3. Remove trailing slash (except root "/")
 * 4. Sort query parameters alphabetically
 * 5. Remove URL fragment (#hash)
 * 6. Remove tracking parameters (utm_*, fbclid, etc.)
 */
export function normalizeUrl(rawUrl: string): string {
  const url = new URL(rawUrl);

  // 1. Lowercase protocol and hostname (URL constructor does this, but be explicit)
  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();

  // 2. Remove default ports
  if (url.port === "80" || url.port === "443") {
    url.port = "";
  }

  // 3. Remove trailing slash (except root path)
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  // 4. Remove tracking parameters
  for (const param of TRACKING_PARAMS) {
    url.searchParams.delete(param);
  }

  // 5. Sort query parameters alphabetically
  const sortedParams = new URLSearchParams(
    [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b))
  );
  url.search = sortedParams.toString();

  // 6. Remove fragment
  url.hash = "";

  return url.toString();
}

/**
 * Generate a SHA-256 hash of a normalized URL.
 * Used as the Redis cache key and for deduplication.
 *
 * @returns 64-character hex string
 */
export function hashUrl(rawUrl: string): string {
  const normalized = normalizeUrl(rawUrl);
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Extract the domain from a URL.
 * Removes "www." prefix for cleaner display.
 *
 * @example
 * extractDomain("https://www.example.com/path") → "example.com"
 * extractDomain("https://blog.example.com") → "blog.example.com"
 */
export function extractDomain(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    let hostname = url.hostname.toLowerCase();

    // Remove www. prefix
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }

    return hostname;
  } catch {
    return rawUrl;
  }
}
