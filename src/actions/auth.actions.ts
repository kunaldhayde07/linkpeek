"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getOrCreateUser } from "@/lib/auth/auth.service";
import { createClient } from "@/lib/auth/supabase/server";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@/lib/auth/auth.schemas";
import { logger } from "@/lib/utils";

// ============================================================================
// Auth Server Actions
// These run on the server and are called from client components via form actions.
// Supabase handles password hashing, JWT issuance, OAuth, and email verification.
// ============================================================================

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirect?: string;
}

/**
 * Sign up a new user with email and password.
 */
export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string | undefined,
  };

  // Validate input
  const parsed = signupSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError };
  }

  const { email, password, name } = parsed.data;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name ?? "",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      logger.warn("Sign up failed", { email, error: error.message });

      if (error.message.includes("already registered")) {
        return { success: false, error: "An account with this email already exists" };
      }

      return { success: false, error: error.message };
    }

    // If email confirmation is required
    if (data.user && !data.session) {
      return { success: true, redirect: "/verify-email" };
    }

    // If auto-confirmed (e.g., in development)
    if (data.user && data.session) {
      await getOrCreateUser(
        data.user.id,
        email,
        name,
        null
      );
      return { success: true, redirect: "/dashboard" };
    }

    return { success: true, redirect: "/verify-email" };
  } catch (error) {
    logger.error("Sign up action failed", {
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Sign in a user with email and password.
 */
export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate input
  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError };
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn("Sign in failed", { email, error: error.message });

      if (error.message.includes("Invalid login credentials")) {
        return { success: false, error: "Invalid email or password" };
      }
      if (error.message.includes("Email not confirmed")) {
        return { success: false, error: "Please verify your email address first" };
      }

      return { success: false, error: error.message };
    }

    if (data.user) {
      // Ensure user profile exists in our database
      await getOrCreateUser(
        data.user.id,
        data.user.email!,
        data.user.user_metadata?.name as string | undefined,
        data.user.user_metadata?.avatar_url as string | undefined
      );
    }

    return { success: true, redirect: "/dashboard" };
  } catch (error) {
    logger.error("Sign in action failed", {
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Sign in with OAuth provider (GitHub or Google).
 */
export async function signInWithOAuthAction(
  provider: "github" | "google"
): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      logger.warn("OAuth sign in failed", { provider, error: error.message });
      return { success: false, error: error.message };
    }

    if (data.url) {
      redirect(data.url);
    }

    return { success: false, error: "Failed to initiate OAuth flow" };
  } catch (error) {
    // redirect() throws a special Next.js error — re-throw it
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    logger.error("OAuth action failed", {
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Send a password reset email.
 */
export async function forgotPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email") as string,
  };

  const parsed = forgotPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid email" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      logger.warn("Password reset failed", { error: error.message });
      // Don't reveal whether the email exists
    }

    // Always return success to prevent email enumeration
    return { success: true };
  } catch (error) {
    logger.error("Forgot password action failed", {
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: true }; // Still return success to prevent enumeration
  }
}

/**
 * Reset password with a new password (after clicking reset email link).
 */
export async function resetPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      logger.warn("Password reset failed", { error: error.message });
      return { success: false, error: error.message };
    }

    return { success: true, redirect: "/dashboard" };
  } catch (error) {
    logger.error("Reset password action failed", {
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Sign out the current user.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
