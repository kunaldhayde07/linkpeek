// Supabase clients
export { createClient as createBrowserClient } from "./supabase/client";
export { createClient as createServerSupabaseClient, createServiceClient } from "./supabase/server";
export { updateSession } from "./supabase/middleware";

// Auth service
export {
  getOrCreateUser,
  getUserById,
  updateUserProfile,
  markEmailVerified,
  deactivateUser,
  deleteUser,
} from "./auth.service";

// API Key service
export {
  createApiKey,
  validateApiKey,
  listApiKeys,
  revokeApiKey,
  getActiveKeyCount,
} from "./api-key.service";

// API Key hashing
export { generateApiKeyPair, hashApiKey, isValidApiKeyFormat } from "./api-key.hash";

// Schemas
export {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createApiKeySchema,
  updateProfileSchema,
} from "./auth.schemas";
export type {
  LoginInput,
  SignupInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  CreateApiKeyInput,
  UpdateProfileInput,
} from "./auth.schemas";

// Types
export type {
  SessionUser,
  ApiKeyDisplay,
  ApiKeyValidation,
  CreatedApiKey,
} from "./auth.types";
