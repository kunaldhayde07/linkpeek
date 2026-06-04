import { prisma } from "@/lib/db";
import { cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { CACHE_TTL, MAX_API_KEYS_PER_USER, logger } from "@/lib/utils";

import { generateApiKeyPair, hashApiKey, isValidApiKeyFormat } from "./api-key.hash";
import type { ApiKeyDisplay, ApiKeyValidation, CreatedApiKey } from "./auth.types";

// ============================================================================
// API Key Service
// CRUD operations + validation for API keys
// ============================================================================

/** Redis cache key for API key validation results */
function apiKeyCacheKey(keyHash: string): string {
  return `ak:${keyHash}`;
}

/**
 * Generate a new API key for a user.
 *
 * @throws Error if user has reached the maximum number of active keys.
 * @returns The created API key (includes raw key shown once to user).
 */
export async function createApiKey(
  userId: string,
  name?: string
): Promise<CreatedApiKey> {
  // Check active key count
  const activeKeyCount = await prisma.apiKey.count({
    where: { userId, revokedAt: null },
  });

  if (activeKeyCount >= MAX_API_KEYS_PER_USER) {
    throw new Error(
      `Maximum of ${MAX_API_KEYS_PER_USER} active API keys reached. Revoke an existing key first.`
    );
  }

  // Generate key pair
  const { rawKey, keyHash, keyPrefix } = generateApiKeyPair();

  // Store hashed key in database
  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name: name ?? null,
      keyHash,
      keyPrefix,
    },
  });

  logger.info("API key created", {
    userId,
    keyId: apiKey.id,
    keyPrefix,
  });

  return {
    id: apiKey.id,
    name: apiKey.name,
    rawKey, // Shown to user ONCE
    keyPrefix: apiKey.keyPrefix,
    createdAt: apiKey.createdAt,
  };
}

/**
 * Validate an API key from an incoming request.
 *
 * Flow:
 * 1. Check format
 * 2. Hash the key
 * 3. Check Redis cache for previous validation
 * 4. If cache miss, look up in database
 * 5. Cache result for 5 minutes
 * 6. Update lastUsedAt
 *
 * @returns Validation result with userId and plan if valid.
 */
export async function validateApiKey(rawKey: string): Promise<ApiKeyValidation> {
  // Step 1: Format check
  if (!isValidApiKeyFormat(rawKey)) {
    return { valid: false, error: "Invalid API key format" };
  }

  // Step 2: Hash the key
  const keyHash = hashApiKey(rawKey);

  // Step 3: Check cache
  const cacheKey = apiKeyCacheKey(keyHash);
  const cached = await cacheGet<ApiKeyValidation>(cacheKey);
  if (cached && cached.valid) {
    // Update lastUsedAt asynchronously (don't block the response)
    updateLastUsed(cached.apiKeyId!).catch(() => {});
    return cached;
  }

  // Step 4: Database lookup
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        select: {
          id: true,
          isActive: true,
          plan: true,
        },
      },
    },
  });

  // Key not found
  if (!apiKey) {
    return { valid: false, error: "Invalid API key" };
  }

  // Key has been revoked
  if (apiKey.revokedAt) {
    return { valid: false, error: "API key has been revoked" };
  }

  // User account is inactive
  if (!apiKey.user.isActive) {
    return { valid: false, error: "User account is inactive" };
  }

  // Step 5: Valid — build result and cache it
  const result: ApiKeyValidation = {
    valid: true,
    userId: apiKey.user.id,
    apiKeyId: apiKey.id,
    plan: apiKey.user.plan,
  };

  // Cache for 5 minutes (trade-off: revoked keys may work for up to 5 min)
  await cacheSet(cacheKey, result, CACHE_TTL.apiKeyLookup);

  // Step 6: Update lastUsedAt asynchronously
  updateLastUsed(apiKey.id).catch(() => {});

  return result;
}

/**
 * Update the lastUsedAt timestamp for an API key.
 * Called asynchronously on each validated request.
 */
async function updateLastUsed(apiKeyId: string): Promise<void> {
  try {
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { lastUsedAt: new Date() },
    });
  } catch (error) {
    // Non-critical — log and continue
    logger.warn("Failed to update API key lastUsedAt", {
      apiKeyId,
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
}

/**
 * List all API keys for a user (for dashboard display).
 * Returns display-safe data (no hashes).
 */
export async function listApiKeys(userId: string): Promise<ApiKeyDisplay[]> {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return keys;
}

/**
 * Revoke an API key (soft delete).
 *
 * @throws Error if key not found or doesn't belong to user.
 */
export async function revokeApiKey(
  keyId: string,
  userId: string
): Promise<void> {
  // Verify ownership
  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });

  if (!apiKey) {
    throw new Error("API key not found");
  }

  if (apiKey.revokedAt) {
    throw new Error("API key is already revoked");
  }

  // Revoke the key
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });

  // Clear the validation cache for this key
  await cacheDel(apiKeyCacheKey(apiKey.keyHash));

  logger.info("API key revoked", {
    userId,
    keyId,
    keyPrefix: apiKey.keyPrefix,
  });
}

/**
 * Get the count of active (non-revoked) API keys for a user.
 */
export async function getActiveKeyCount(userId: string): Promise<number> {
  return prisma.apiKey.count({
    where: { userId, revokedAt: null },
  });
}
