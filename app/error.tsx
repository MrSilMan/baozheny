"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-8">
      <h2 className="font-display text-2xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred. Our team has been notified.
        {error.digest && <span className="block text-xs mt-1 text-muted-foreground/60">Error ID: {error.digest}</span>}
      </p>
      <Button onClick={reset} variant="default">Try Again</Button>
    </div>
  );
}
