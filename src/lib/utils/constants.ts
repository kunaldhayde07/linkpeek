// ============================================================================
// Application Constants
// ============================================================================

/** API key prefix for identification */
export const API_KEY_PREFIX = "lp_live_" as const;

/** Maximum number of active API keys per user */
export const MAX_API_KEYS_PER_USER = 5;

/** Rate limits by plan (requests per day) */
export const RATE_LIMITS = {
  free: 100,
  pro: 10_000,
  enterprise: 100_000,
  unauthenticated: 10,
} as const;

/** Cache TTLs in seconds */
export const CACHE_TTL = {
  preview: 86_400,          // 24 hours
  screenshot: 604_800,      // 7 days
  apiKeyLookup: 300,        // 5 minutes
  rateLimitWindow: 86_400,  // 24 hours
} as const;

/** Preview extraction limits */
export const PREVIEW_LIMITS = {
  fetchTimeout: 10_000,       // 10 seconds
  playwrightTimeout: 30_000,  // 30 seconds
  maxRedirects: 5,
  maxContentLength: 10_485_760, // 10MB
  maxUrlLength: 2048,
  maxConcurrentPlaywright: 3,
  batchMaxUrls: 50,
  batchConcurrency: 5,
} as const;

/** Pagination defaults */
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;

/** Viewport presets for screenshots */
export const VIEWPORT_PRESETS = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

/** CSV import limits */
export const CSV_LIMITS = {
  maxRows: 500,
  maxFileSize: 5_242_880, // 5MB
} as const;

/** User agent string for outgoing requests */
export const USER_AGENT =
  "LinkPeekBot/1.0 (+https://linkpeek.app/bot; link preview service)" as const;

/** Private IP ranges for SSRF prevention */
export const PRIVATE_IP_PATTERNS = [
  /^127\./,                          // Loopback
  /^10\./,                           // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./,    // Class B private
  /^192\.168\./,                     // Class C private
  /^169\.254\./,                     // Link-local
  /^0\./,                            // Current network
  /^100\.(6[4-9]|[7-9]\d|1[0-2]\d|127)\./, // Shared address space
] as const;

/** Blocked hostnames for SSRF prevention */
export const BLOCKED_HOSTNAMES = [
  "localhost",
  "metadata.google.internal",
  "metadata.internal",
  "169.254.169.254",
] as const;

/** Tracking query parameters to strip from URLs before caching */
export const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "ref",
] as const;
