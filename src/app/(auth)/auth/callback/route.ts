import { NextResponse } from "next/server";

import { getOrCreateUser } from "@/lib/auth/auth.service";
import { createClient } from "@/lib/auth/supabase/server";
import { logger } from "@/lib/utils";

/**
 * OAuth Callback Handler
 *
 * This route handles the redirect after a user completes OAuth authentication
 * with GitHub or Google. Supabase sends the user here with an auth code.
 *
 * Flow:
 * 1. Extract the auth code from the URL
 * 2. Exchange it for a session via Supabase
 * 3. Create/update our user profile
 * 4. Redirect to dashboard
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error("OAuth callback error", { error: error.message });
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    if (data.user) {
      try {
        // Create/update user profile in our database
        await getOrCreateUser(
          data.user.id,
          data.user.email!,
          (data.user.user_metadata?.full_name as string) ??
            (data.user.user_metadata?.name as string) ??
            null,
          (data.user.user_metadata?.avatar_url as string) ?? null
        );
      } catch (profileError) {
        logger.error("Failed to create user profile during OAuth callback", {
          userId: data.user.id,
          error: profileError instanceof Error ? profileError.message : "Unknown",
        });
        // Continue to dashboard even if profile creation fails
        // The profile will be created on next page load
      }
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  logger.warn("OAuth callback called without code");
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
