import { z } from "zod";

// ============================================================================
// Auth Zod Schemas
// ============================================================================

/** Login form schema */
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .max(255),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

/** Signup form schema */
export const signupSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .max(255),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255)
    .optional(),
});

/** Forgot password schema */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address"),
});

/** Reset password schema */
export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/** API key creation schema */
export const createApiKeySchema = z.object({
  name: z
    .string()
    .max(100, "Name must be less than 100 characters")
    .optional(),
});

/** Profile update schema */
export const updateProfileSchema = z.object({
  name: z.string().max(255).optional(),
  avatarUrl: z.string().url().max(1024).optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
