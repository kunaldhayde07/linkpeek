import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils";

import type { SessionUser } from "./auth.types";

// ============================================================================
// Auth Service
// Handles user profile management in our database.
// Supabase Auth handles actual authentication (JWT, OAuth, password hashing).
// This service manages our `users` table (app-specific profile data).
// ============================================================================

/**
 * Get or create a user profile in our database.
 * Called after successful Supabase authentication.
 *
 * Supabase Auth creates a record in `auth.users`.
 * This function ensures a corresponding record exists in our `public.users` table.
 */
export async function getOrCreateUser(
  supabaseUserId: string,
  email: string,
  name?: string | null,
  avatarUrl?: string | null
): Promise<SessionUser> {
  try {
    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { id: supabaseUserId },
    });

    if (!user) {
      // Create new user profile
      user = await prisma.user.create({
        data: {
          id: supabaseUserId,
          email,
          name: name ?? null,
          avatarUrl: avatarUrl ?? null,
          emailVerified: true, // OAuth users are pre-verified
          plan: "free",
          isActive: true,
        },
      });

      logger.info("New user profile created", {
        userId: user.id,
        email: user.email,
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    logger.error("Failed to get or create user", {
      supabaseUserId,
      error: error instanceof Error ? error.message : "Unknown",
    });
    throw error;
  }
}

/**
 * Get a user's profile by their ID.
 */
export async function getUserById(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    plan: user.plan,
    emailVerified: user.emailVerified,
  };
}

/**
 * Update a user's profile.
 */
export async function updateUserProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string | null }
): Promise<SessionUser> {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    plan: user.plan,
    emailVerified: user.emailVerified,
  };
}

/**
 * Mark a user's email as verified.
 */
export async function markEmailVerified(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true },
  });
}

/**
 * Soft-delete a user account.
 * Sets is_active to false and marks all API keys as revoked.
 */
export async function deactivateUser(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    }),
    prisma.apiKey.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  logger.info("User account deactivated", { userId });
}

/**
 * Permanently delete a user and all associated data.
 * CASCADE deletes handle cleanup automatically.
 */
export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId },
  });

  logger.info("User account permanently deleted", { userId });
}
