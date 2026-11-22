"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/client-api";
import { DASHBOARD_HOME } from "@/lib/constants";
import { isValidEmail, normalizeError } from "@/lib/validation";
import type { Role } from "@/lib/types";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { data: session } = useSession();

  const [form, setForm] = React.useState({ email: "", password: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const safeRedirect =
    redirectTo &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//") &&
    !redirectTo.startsWith("/\\")
      ? redirectTo
      : null;

  React.useEffect(() => {
    if (session?.user) {
      const role = ((session.user as { role?: Role }).role as Role) ?? "customer";
      router.replace(safeRedirect ?? DASHBOARD_HOME[role]);
    }
  }, [session, router, safeRedirect]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Record<string, string> = {};
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const result = await signIn.email({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (result.error) {
        const message = normalizeError(
          result.error,
          "Incorrect email or password."
        );
        toast.error(message);
        setErrors({ form: message });
        return;
      }

      // A new session must never reuse the previous account's cached API token.
      clearAuthToken();

      const data = result.data as { user?: { role?: Role } } | null;
      const role = data?.user?.role ?? "customer";
      toast.success("Welcome back to FixMate!");
      router.replace(safeRedirect ?? DASHBOARD_HOME[role]);
      router.refresh();
    } catch (error) {
      const message = normalizeError(error, "Could not sign you in.");
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <span className="eyebrow">
        <ShieldCheck className="size-3 text-accent-foreground dark:text-accent" />
        Welcome back
      </span>
      <h1 className="mt-4 font-heading text-3xl leading-tight font-bold">
        Sign in to FixMate
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick up right where you left off — your jobs, services and payments are
        waiting.
      </p>
      
      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold">
            Email address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              className="h-11 pl-9"
            />
          </div>
          {errors.email && (
            <p className="text-[11px] font-medium text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold">
              Password
            </Label>
            <span className="text-[10px] text-muted-foreground">
              At least 6 characters
            </span>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Your password"
              aria-invalid={Boolean(errors.password)}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] font-medium text-destructive">
              {errors.password}
            </p>
          )}
        </div>

        {errors.form && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/8 px-3 py-2 text-xs font-medium text-destructive">
            {errors.form}
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-xl text-sm font-semibold"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="size-4" />
              Sign in
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          New to FixMate?{" "}
          <Link href="/sign-up" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded-full bg-muted" />
          <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      }
    >
      <SignInForm />
    </React.Suspense>
  );
}