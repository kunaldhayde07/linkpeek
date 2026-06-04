import { BLOCKED_HOSTNAMES, PRIVATE_IP_PATTERNS, PREVIEW_LIMITS } from "@/lib/utils";

// ============================================================================
// URL Validator — SSRF Prevention
//
// This is the #1 security concern for a URL-fetching service.
// An attacker could submit URLs pointing to:
//   - Cloud metadata endpoints (169.254.169.254)
//   - Internal services (localhost, 10.x.x.x)
//   - Non-HTTP protocols (file://, ftp://)
//
// Every URL is validated through a 4-step pipeline before any fetch.
// ============================================================================

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
}

/**
 * Validate a URL for safety and correctness.
 *
 * Checks:
 * 1. Valid URL format (parseable by URL constructor)
 * 2. HTTP or HTTPS protocol only
 * 3. Not exceeding max URL length
 * 4. Hostname is not a blocked/private address
 * 5. IP address is not in a private range
 */
export function validateUrl(rawUrl: string): UrlValidationResult {
  // Step 1: Basic format validation
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, error: "URL is required" };
  }

  if (rawUrl.length > PREVIEW_LIMITS.maxUrlLength) {
    return { valid: false, error: `URL must be less than ${PREVIEW_LIMITS.maxUrlLength} characters` };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  // Step 2: Protocol check
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return {
      valid: false,
      error: `Only HTTP and HTTPS URLs are allowed. Got: ${parsed.protocol}`,
    };
  }

  // Step 3: Hostname validation
  const hostname = parsed.hostname.toLowerCase();

  // Check blocked hostnames
  if (BLOCKED_HOSTNAMES.some((blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`))) {
    return { valid: false, error: "This hostname is not allowed" };
  }

  // Check if hostname is a raw IP address
  if (isIpAddress(hostname)) {
    if (isPrivateIp(hostname)) {
      return { valid: false, error: "Private and internal IP addresses are not allowed" };
    }
  }

  // Step 4: Port check — block unusual ports that might target internal services
  if (parsed.port) {
    const port = parseInt(parsed.port, 10);
    const allowedPorts = [80, 443, 8080, 8443, 3000, 5000, 8000];
    if (!allowedPorts.includes(port)) {
      return { valid: false, error: `Port ${port} is not allowed` };
    }
  }

  return { valid: true, normalizedUrl: parsed.toString() };
}

/**
 * Check if a string is an IPv4 address.
 */
function isIpAddress(hostname: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Pattern.test(hostname)) {
    return true;
  }

  // IPv6 pattern (simplified — brackets are stripped by URL parser)
  if (hostname.includes(":")) {
    return true;
  }

  return false;
}

/**
 * Check if an IP address is in a private/reserved range.
 */
function isPrivateIp(ip: string): boolean {
  // Check against all private IP patterns
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

/**
 * Validate a redirect URL during fetch following.
 * Re-applies the same safety checks to each redirect hop.
 */
export function validateRedirectUrl(redirectUrl: string, originalUrl: string): UrlValidationResult {
  const result = validateUrl(redirectUrl);
  if (!result.valid) {
    return {
      valid: false,
      error: `Redirect to blocked URL: ${result.error}`,
    };
  }
  return result;
}
