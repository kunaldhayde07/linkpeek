"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { forgotPasswordAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await forgotPasswordAction(formData);

      if (result.success) {
        setIsSubmitted(true);
        toast.success("If an account exists, a reset link has been sent.");
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
            ✉️
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists with that email, we&apos;ve sent a password reset link.
            Please check your inbox and spam folder.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
