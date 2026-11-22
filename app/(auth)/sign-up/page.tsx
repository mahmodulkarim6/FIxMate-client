"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, useSession } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/client-api";
import { DASHBOARD_HOME } from "@/lib/constants";
import { normalizeError, passwordIssues } from "@/lib/validation";
import type { Role } from "@/lib/types";

const ROLES: {
  value: Exclude<Role, "admin">;
  title: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  {
    value: "customer",
    title: "Customer",
    description: "Book repairs and pay after the job is done.",
    icon: UserRound,
  },
  {
    value: "technician",
    title: "Technician",
    description: "List repair services and manage job requests.",
    icon: Wrench,
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [role, setRole] = React.useState<"customer" | "technician">("customer");
  const [form, setForm] = React.useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (session?.user) {
      const existingRole =
        ((session.user as { role?: Role }).role as Role) ?? "customer";
      router.replace(DASHBOARD_HOME[existingRole]);
    }
  }, [session, router]);

  const issues = passwordIssues(form.password);
  const passwordValid = issues.length === 0;

  function validate() {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) {
      next.name = "Enter your full name (at least 3 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!passwordValid) {
      next.password = "Your password does not meet the requirements below.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await signUp.email({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role,
      } as Parameters<typeof signUp.email>[0]);

      if (result.error) {
        const message = normalizeError(
          result.error,
          "Could not create your account."
        );
        toast.error(message);
        setErrors({ form: message });
        return;
      }

      // A new session must never reuse the previous account's cached API token.
      clearAuthToken();

      toast.success("Account created — welcome to FixMate!");
      router.replace(DASHBOARD_HOME[role]);
      router.refresh();
    } catch (error) {
      const message = normalizeError(error, "Could not create your account.");
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
        Create your account
      </span>
      <h1 className="mt-4 font-heading text-3xl leading-tight font-bold">
        Join FixMate in a minute
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose how you want to use the platform. Admin accounts are created by
        the FixMate team only.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {ROLES.map((option) => {
            const selected = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setRole(option.value)}
                className={`relative rounded-2xl border p-3.5 text-left transition-all ${
                  selected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <span
                  className={`grid size-8 place-items-center rounded-lg ${
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <option.icon className="size-4" />
                </span>
                <p className="mt-2.5 text-sm font-semibold">{option.title}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {option.description}
                </p>
                {selected && (
                  <span className="absolute top-3 right-3 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-2.5" strokeWidth={4} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold">
            Full name
          </Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              autoComplete="name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="e.g. Mahmodul karim"
              aria-invalid={Boolean(errors.name)}
              className="h-11 pl-9"
            />
          </div>
          {errors.name && (
            <p className="text-[11px] font-medium text-destructive">{errors.name}</p>
          )}
        </div>

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
          <Label htmlFor="password" className="text-xs font-semibold">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Create a strong password"
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

          <ul className="mt-2 grid gap-1">
            {[
              { label: "At least 6 characters", ok: form.password.length >= 6 },
              {
                label: "At least one uppercase letter",
                ok: /[A-Z]/.test(form.password),
              },
              {
                label: "At least one lowercase letter",
                ok: /[a-z]/.test(form.password),
              },
            ].map((rule) => (
              <li
                key={rule.label}
                className={`flex items-center gap-1.5 text-[11px] ${
                  rule.ok ? "text-emerald-600" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`grid size-3.5 place-items-center rounded-full ${
                    rule.ok ? "bg-emerald-500/15" : "bg-secondary"
                  }`}
                >
                  <Check className="size-2.5" strokeWidth={4} />
                </span>
                {rule.label}
              </li>
            ))}
          </ul>
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
              Creating account…
            </>
          ) : (
            <>Create {role} account</>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
