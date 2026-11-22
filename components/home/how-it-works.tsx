import { CreditCard, Search, Send, Wrench } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";

const STEPS = [
  {
    title: "Find a service",
    description:
      "Browse approved repair services by category, price, area or service mode.",
    icon: Search,
  },
  {
    title: "Send a request",
    description:
      "Share your phone, address, preferred date and what is wrong with the device.",
    icon: Send,
  },
  {
    title: "Technician fixes it",
    description:
      "Accept, start work, then set the final amount when the repair is complete.",
    icon: Wrench,
  },
  {
    title: "Pay after completion",
    description:
      "The Pay Now button unlocks only when the job is completed. Card payment via Stripe.",
    icon: CreditCard,
  },
];

export function HowItWorks() {
  return (
    <section className="section border-y border-border/70 bg-card/50">
      <div className="shell">
        <SectionHeading
          eyebrow="How FixMate works"
          title="Four steps, zero guesswork"
          description="A repair request becomes a trackable job with a clear owner and a fixed next step — for both sides of the counter."
          align="center"
        />

        <div className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute top-12 right-[12%] left-[12%] hidden border-t border-dashed border-border lg:block" />
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="surface-card relative flex h-full flex-col p-5"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">
                  <step.icon className="size-5" />
                </span>
                <span className="font-heading text-3xl font-extrabold text-border">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 font-heading text-base font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
