import "@testing-library/jest-dom/vitest";

// ============================================================================
// Global Test Setup
// ============================================================================

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.DIRECT_URL = "postgresql://test:test@localhost:5432/test";
process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-redis-token";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_NAME = "LinkPeek";
process.env.API_KEY_SALT = "test-salt-64-chars-minimum-for-security-purposes-1234567890abcdef";

// Suppress console.warn/error in tests unless DEBUG=true
if (!process.env.DEBUG) {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
}
