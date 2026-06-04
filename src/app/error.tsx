"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-destructive">500</p>
        <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6">
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}
