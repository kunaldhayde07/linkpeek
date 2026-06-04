import { createHash, randomBytes } from "crypto";

import { API_KEY_PREFIX } from "@/lib/utils";

// ============================================================================
// API Key Hashing Utilities
//
// Security model:
// - Raw key is generated with crypto.randomBytes (CSPRNG)
// - Raw key is shown to user ONCE at creation
// - SHA-256 hash of raw key is stored in database
// - On each API request, the bearer token is hashed and looked up
// - Even if the database is compromised, raw keys cannot be recovered
// ============================================================================

/**
 * Generate a new API key.
 *
 * @returns Object containing:
 *   - rawKey: The full key to show to the user (e.g., "lp_live_a3f2b9c8...")
 *   - keyHash: SHA-256 hash to store in database
 *   - keyPrefix: First 16 chars for display after creation
 */
export function generateApiKeyPair(): {
  rawKey: string;
  keyHash: string;
  keyPrefix: string;
} {
  // Generate 32 random bytes = 64 hex chars of entropy
  const randomPart = randomBytes(32).toString("hex");
  const rawKey = `${API_KEY_PREFIX}${randomPart}`;

  // Hash the full key with SHA-256
  const keyHash = hashApiKey(rawKey);

  // Store prefix for display (lp_live_ + first 8 hex chars)
  const keyPrefix = rawKey.substring(0, 16);

  return { rawKey, keyHash, keyPrefix };
}

/**
 * Hash an API key using SHA-256.
 * Used both at creation time (to store) and at validation time (to lookup).
 */
export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Validate that a string looks like a valid API key format.
 * Does NOT check if the key exists in the database.
 */
export function isValidApiKeyFormat(key: string): boolean {
  // Must start with the correct prefix
  if (!key.startsWith(API_KEY_PREFIX)) {
    return false;
  }

  // Must be exactly prefix (8 chars) + 64 hex chars = 72 chars total
  if (key.length !== API_KEY_PREFIX.length + 64) {
    return false;
  }

  // The random part must be valid hex
  const randomPart = key.substring(API_KEY_PREFIX.length);
  return /^[0-9a-f]{64}$/.test(randomPart);
}
