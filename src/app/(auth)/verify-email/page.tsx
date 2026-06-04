import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Check your email to verify your account",
};

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
          ✉️
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve sent a verification link to your email address.
          <br />
          Click the link to verify your account and get started.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or try signing up again.
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Back to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
