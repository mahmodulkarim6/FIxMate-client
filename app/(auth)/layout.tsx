import Link from "next/link";
import { ArrowLeft, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="dotted-bg pointer-events-none absolute inset-0 opacity-[0.12]" />
        <div className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <Logo inverted />
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase">
            <Sparkles className="size-3.5 text-accent" />
            FixMate accounts
          </span>
          <h2 className="mt-5 font-heading text-4xl leading-[1.08] font-bold text-balance">
            One account. The right dashboard for what you do.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
            Customers track repairs and pay after completion. Technicians manage
            listings and incoming jobs. Admins keep quality high.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-primary-foreground/80">
            {[
              "Verified technicians, admin-approved listings",
              "Job status you can follow without calling",
              "Stripe test payments, only after completion",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="grid size-5 place-items-center rounded-full bg-accent/20 text-accent">
                  <BadgeCheck className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-[11px] text-primary-foreground/50">
          <ShieldCheck className="size-3.5" />
          Your account details are stored with BetterAuth.
        </div>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 lg:justify-end lg:border-none">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to home
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
