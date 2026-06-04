import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for use in the browser (Client Components).
 *
 * Uses the anon key which respects Row Level Security.
 * Cached per browser session — safe to call multiple times.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
