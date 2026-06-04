"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { updateUserProfile, deactivateUser, deleteUser } from "@/lib/auth/auth.service";
import { createClient } from "@/lib/auth/supabase/server";
import { updateProfileSchema } from "@/lib/auth/auth.schemas";
import { logger } from "@/lib/utils";

// ============================================================================
// Settings Server Actions
// Profile updates, password change, account deletion
// ============================================================================

export interface SettingsActionResult {
  success: boolean;
  error?: string;
}

/**
 * Update the current user's profile (name, avatar).
 */
export async function updateProfileAction(formData: FormData): Promise<SettingsActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const rawData = {
    name: (formData.get("name") as string) || undefined,
    avatarUrl: (formData.get("avatarUrl") as string) || undefined,
  };

  const parsed = updateProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    await updateUserProfile(user.id, {
      name: parsed.data.name,
      avatarUrl: parsed.data.avatarUrl,
    });

    // Also update Supabase auth metadata
    await supabase.auth.updateUser({
      data: { name: parsed.data.name },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    logger.error("Profile update failed", {
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Change the current user's password.
 */
export async function changePasswordAction(formData: FormData): Promise<SettingsActionResult> {
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(newPassword)) {
    return { success: false, error: "Password must contain at least one uppercase letter" };
  }

  if (!/[0-9]/.test(newPassword)) {
    return { success: false, error: "Password must contain at least one number" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logger.error("Password change failed", {
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: false, error: "Failed to change password" };
  }
}

/**
 * Delete the current user's account and all associated data.
 * This is a destructive, irreversible action (GDPR Article 17).
 */
export async function deleteAccountAction(formData: FormData): Promise<SettingsActionResult> {
  const confirmEmail = formData.get("confirmEmail") as string;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify the user typed their email correctly
  if (confirmEmail !== user.email) {
    return { success: false, error: "Email does not match. Please type your email to confirm." };
  }

  try {
    // 1. Delete user data from our database (CASCADE handles all related data)
    await deleteUser(user.id);

    // 2. Sign out the user
    await supabase.auth.signOut();

    logger.info("User account deleted", { userId: user.id });

    return { success: true };
  } catch (error) {
    logger.error("Account deletion failed", {
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: false, error: "Failed to delete account. Please try again or contact support." };
  }
}
