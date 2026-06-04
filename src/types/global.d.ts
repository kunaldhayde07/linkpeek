// ============================================================================
// Global Type Declarations
// ============================================================================

/** Extend NodeJS ProcessEnv with our environment variables */
declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;

    // Database
    DATABASE_URL: string;
    DIRECT_URL: string;

    // Redis
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;

    // Application
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_APP_NAME: string;

    // Security
    API_KEY_SALT: string;

    // Node
    NODE_ENV: "development" | "production" | "test";
  }
}
