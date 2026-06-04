import { randomBytes, createHash } from "crypto";

/**
 * Generate cryptographically secure random bytes as hex string.
 */
export function generateRandomHex(byteLength: number = 32): string {
  return randomBytes(byteLength).toString("hex");
}

/**
 * Compute SHA-256 hash of input string.
 * Used for API key hashing and URL cache key generation.
 */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Generate a new API key with the standard prefix.
 * Returns both the raw key (shown once to user) and the hash (stored in DB).
 */
export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const rawKey = `lp_live_${generateRandomHex(32)}`;
  const keyHash = sha256(rawKey);
  const keyPrefix = rawKey.substring(0, 16); // "lp_live_xxxxxxxx"

  return { rawKey, keyHash, keyPrefix };
}

/**
 * Generate a unique request ID for tracing.
 */
export function generateRequestId(): string {
  return `req_${generateRandomHex(12)}`;
}
