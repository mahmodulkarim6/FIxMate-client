import {
  BadgeCheck,
  Clock3,
  CreditCard,
  Headphones,
  Quote,
  ShieldCheck,
  Star,
} from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";

const TRUST_POINTS = [
  {
    title: "Verified, not random",
    description:
      "Admins review every service listing before it goes live, and technicians carry an ID-verified profile.",
    icon: BadgeCheck,
  },
  {
    title: "Pay only when it is fixed",
    description:
      "No advance. The Pay Now button appears after the technician marks the job completed and sets the final amount.",
    icon: CreditCard,
  },
  {
    title: "Every step is visible",
    description:
      "Requested → Accepted → In Progress → Completed. You always know who has your device and what happens next.",
    icon: Clock3,
  },
  {
    title: "Support that answers",
    description:
      "Questions about an active job? Our team steps in between you and the technician until it is resolved.",
    icon: Headphones,
  },
];

const REVIEWS = [
  {
    quote:
      "My iPhone screen was replaced the same afternoon. The technician set the final price after checking the phone, and I paid right from the dashboard.",
    name: "Nusrat Jahan",
    area: "Dhanmondi, Dhaka",
    service: "iPhone screen replacement",
    initials: "NJ",
    color: "#0f4f52",
  },
  {
    quote:
      "Booked an AC deep clean before summer. I could follow the status without calling anyone, and the payment unlocked only after the job was done.",
    name: "Tanvir Ahmed",
    area: "Uttara, Dhaka",
    service: "Split AC servicing",
    initials: "TA",
    color: "#2b6f86",
  },
  {
    quote:
      "As a technician, FixMate gives me a proper place to list my services. Admin approval makes customers trust the profile, and bookings are organised.",
    name: "Rakib Hasan",
    area: "Mirpur, Dhaka",
    service: "Verified technician",
    initials: "RH",
    color: "#8a6a2c",
  },
];

export function WhyChooseUs() {
  return (
    <section className="section">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Why FixMate"
              title="Built for the awkward middle part of a repair"
              description="The part where your device is gone, nobody picks up the phone, and someone asks for money before touching a screwdriver."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {TRUST_POINTS.map((point) => (
                <div
                  key={point.title}
                  className="rounded-2xl border border-border/80 bg-card p-4"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <point.icon className="size-4" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{point.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="surface-card overflow-hidden bg-primary p-6 text-primary-foreground sm:p-8">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
                  <ShieldCheck className="size-3.5" />
                  Trust snapshot
                </span>
                <span className="font-heading text-2xl font-bold text-accent">
                  FixMate
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6">
                {[
                  { value: "12.4k", label: "Repairs completed" },
                  { value: "4.9/5", label: "Average rating" },
                  { value: "180+", label: "Verified technicians" },
                  { value: "7", label: "Repair categories" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-heading text-3xl leading-none font-extrabold">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs text-primary-foreground/65">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-white/12 bg-white/5 p-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="size-3.5 fill-accent text-accent"
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
                  “The final amount was set after the technician finished, and
                  the payment page showed exactly what I was paying for.”
                </p>
              </div>
            </div>

            <div className="dotted-bg pointer-events-none absolute -right-2 -bottom-6 -z-10 size-40 rounded-3xl opacity-40 sm:-right-6" />
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <figure
              key={review.name}
              className="surface-card flex h-full flex-col p-5"
            >
              <Quote className="size-6 text-accent-foreground/40 dark:text-accent/50" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {review.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
                <span
                  className="grid size-9 place-items-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: review.color }}
                >
                  {review.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{review.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {review.area} · {review.service}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
