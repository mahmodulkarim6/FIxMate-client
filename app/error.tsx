"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[fixmate] Unhandled UI error", error);
  }, [error]);

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(65%_60%_at_50%_0%,color-mix(in_oklch,var(--destructive)_10%,transparent),transparent_70%)]" />

      <header className="shell flex h-16 items-center">
        <Logo />
      </header>

      <main className="shell flex flex-1 items-center justify-center py-16">
        <div className="surface-card w-full max-w-lg p-8 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-8" />
          </span>

          <h1 className="mt-5 font-heading text-2xl font-bold">
            Something broke on our side
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            An unexpected error stopped this page from rendering. Nothing was
            charged and your bookings are unchanged — try again, and if it keeps
            happening the API server may be offline.
          </p>

          {error.digest && (
            <p className="mx-auto mt-4 w-fit rounded-full bg-secondary px-3 py-1 font-mono text-[10px] text-muted-foreground">
              digest: {error.digest}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button className="rounded-full" onClick={reset}>
              <RotateCcw className="size-4" />
              Try again
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              render={<Link href="/" />}
            >
              <Home className="size-4" />
              Back to home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
