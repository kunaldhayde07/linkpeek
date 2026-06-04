// ============================================================================
// Auth Domain Types
// ============================================================================

/** Authenticated user session data */
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: "free" | "pro" | "enterprise";
  emailVerified: boolean;
}

/** API key data (for display — excludes hash) */
export interface ApiKeyDisplay {
  id: string;
  name: string | null;
  keyPrefix: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

/** API key validation result */
export interface ApiKeyValidation {
  valid: boolean;
  userId?: string;
  apiKeyId?: string;
  plan?: "free" | "pro" | "enterprise";
  error?: string;
}

/** Newly created API key (includes raw key shown once) */
export interface CreatedApiKey {
  id: string;
  name: string | null;
  rawKey: string;
  keyPrefix: string;
  createdAt: Date;
}
