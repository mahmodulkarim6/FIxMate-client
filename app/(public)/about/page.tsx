import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleDollarSign,
  Clock3,
  CreditCard,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata = {
  title: "How FixMate works",
  description:
    "Understand the FixMate repair pipeline, the three roles, and why payment happens only after a job is completed.",
};

const STEPS = [
  {
    label: "Requested",
    note: "Customer sends the job",
    tone: "text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/20",
  },
  {
    label: "Accepted",
    note: "Technician takes it on",
    tone: "text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    label: "In Progress",
    note: "Work has started",
    tone: "text-amber-800 dark:text-amber-300 bg-amber-500/12 border-amber-500/25",
  },
  {
    label: "Completed",
    note: "Final amount is set",
    tone: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/12 border-emerald-500/20",
  },
  {
    label: "Paid",
    note: "Stripe checkout confirmed",
    tone: "text-primary bg-primary/10 border-primary/25",
  },
];

const ROLES = [
  {
    title: "Customer",
    icon: UserRound,
    points: [
      "Browse approved services with search, filters and sorting",
      "Send a repair request with date and problem description",
      "Cancel only while the request is still pending",
      "Pay after completion and keep a payment history",
    ],
  },
  {
    title: "Technician",
    icon: Wrench,
    points: [
      "List services with ImgBB image uploads and pricing",
      "Accept or reject incoming repair requests",
      "Move jobs forward and set the final amount",
      "Toggle availability and manage every listing",
    ],
  },
  {
    title: "Admin",
    icon: ShieldCheck,
    points: [
      "Approve or reject every service listing",
      "Manage user roles (never their own)",
      "Monitor all bookings across technicians",
      "Track platform revenue from Stripe payments",
    ],
  },
];

const PRINCIPLES = [
  {
    title: "Money follows work",
    description:
      "No advance payment, ever. The customer's Pay Now button stays locked until the technician marks the job completed.",
    icon: CreditCard,
  },
  {
    title: "One source of truth",
    description:
      "Bookings copy the service and technician details, so history stays intact even if a listing is edited later.",
    icon: BadgeCheck,
  },
  {
    title: "Server-enforced rules",
    description:
      "Status changes, ownership and payment gates are validated on the API — not just hidden in the UI.",
    icon: ShieldCheck,
  },
  {
    title: "Built for both sides",
    description:
      "Customers get clarity. Technicians get a moderated storefront and an organised job queue.",
    icon: HeartHandshake,
  },
];

export default function AboutPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklch,var(--accent)_12%,transparent),transparent)]" />

      <section className="shell pt-12 pb-10 sm:pt-16">
        <span className="eyebrow">
          <Sparkles className="size-3 text-accent-foreground dark:text-accent" />
          How it works
        </span>
        <h1 className="display-title mt-5 max-w-3xl">
          A repair pipeline you can actually follow.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          FixMate is a role-based repair service platform for smart devices and
          home appliances. Verified technicians list what they fix, customers
          book with a real request, and every job moves through a strict,
          trackable status pipeline.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { value: "3", label: "Roles — customer, technician, admin" },
            { value: "4", label: "Connected collections behind every job" },
            { value: "1", label: "Payment, after the repair is complete" },
          ].map((item) => (
            <div
              key={item.label}
              className="surface-card flex items-baseline gap-3 p-5"
            >
              <span className="font-heading text-3xl font-extrabold text-primary">
                {item.value}
              </span>
              <span className="text-xs leading-snug text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section border-y border-border/70 bg-card/50">
        <div className="shell">
          <SectionHeading
            eyebrow="The pipeline"
            title="One step at a time — no shortcuts"
            description="Only a requested job can branch off (rejected by the technician or cancelled by the customer). Everything else moves one stage forward, and the server rejects anything else."
          />

          <div className="mt-10 overflow-x-auto pb-2">
            <div className="flex min-w-[760px] items-stretch gap-2">
              {STEPS.map((step, index) => (
                <div key={step.label} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex-1 rounded-2xl border px-4 py-4 ${step.tone}`}
                  >
                    <p className="font-heading text-sm font-bold">{step.label}</p>
                    <p className="mt-1 text-[10px] leading-snug opacity-80">
                      {step.note}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/8 px-3 py-1.5 font-medium text-rose-700 dark:text-rose-300">
              <X className="size-3" /> Requested → Rejected (technician)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-slate-500/8 px-3 py-1.5 font-medium text-slate-600 dark:text-slate-300">
              <X className="size-3" /> Requested → Cancelled (customer)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 font-medium text-emerald-700 dark:text-emerald-300">
              <Check className="size-3" /> Completed + unpaid → Paid (Stripe)
            </span>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "No duplicate active requests",
                description:
                  "A customer cannot hold two active requests for the same service at once.",
                icon: Clock3,
              },
              {
                title: "Everyone sees only their own jobs",
                description:
                  "A technician can only update bookings that carry their email; a customer only sees their own.",
                icon: UserRound,
              },
              {
                title: "Payment is gated",
                description:
                  "Only a completed, unpaid booking owned by the customer can start a Stripe checkout.",
                icon: CircleDollarSign,
              },
            ].map((item) => (
              <div key={item.title} className="surface-card p-5">
                <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                  <item.icon className="size-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading
            eyebrow="Who does what"
            title="Three roles, clearly separated"
            description="Every dashboard is protected by role. Opening another role's route redirects you to your own dashboard."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {ROLES.map((role, index) => (
              <div
                key={role.title}
                className={`surface-card flex h-full flex-col p-5 ${
                  index === 1 ? "ring-1 ring-primary/20" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <role.icon className="size-5" />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {role.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                  {role.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-2.5" strokeWidth={3.5} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-t border-border/70 bg-card/50">
        <div className="shell">
          <SectionHeading
            eyebrow="Our principles"
            title="Why this setup earns trust"
            align="center"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((item) => (
              <div key={item.title} className="surface-card p-5">
                <span className="grid size-9 place-items-center rounded-xl bg-accent/25 text-accent-foreground dark:text-accent">
                  <item.icon className="size-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-3xl border border-border/80 bg-card p-8 text-center sm:p-10">
            <h3 className="font-heading text-2xl font-semibold">
              Ready to get something fixed?
            </h3>
            <p className="max-w-lg text-sm text-muted-foreground">
              Browse approved services or join as a technician and list what you
              repair best.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button className="rounded-full" render={<Link href="/services" />}>
                Browse services
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                render={<Link href="/sign-up" />}
              >
                Create an account
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
