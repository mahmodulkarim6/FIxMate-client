import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { CategoryIcon } from "@/components/shared/category-icon";
import { CATEGORIES } from "@/lib/constants";

export function CategoriesSection() {
  return (
    <section className="section">
      <div className="shell">
        <SectionHeading
          eyebrow="Popular categories"
          title="What needs fixing today?"
          description="Pick a category to jump straight into approved services from verified technicians — no haggling, no door-to-door searching."
          action={{ href: "/services", label: "See all services" }}
        />

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORIES.map((category, index) => (
            <Link
              key={category.name}
              href={`/services?category=${encodeURIComponent(category.name)}`}
              className={`group surface-card hover-lift relative flex flex-col justify-between gap-6 p-5 ${
                index === 0 ? "lg:row-span-2 lg:justify-start" : ""
              }`}
            >
              <div>
                <span
                  className={`grid size-11 place-items-center rounded-2xl transition-colors ${
                    index === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  }`}
                >
                  <CategoryIcon name={category.icon} className="size-5" />
                </span>
                <h3 className="mt-4 font-heading text-base font-semibold">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {category.blurb}
                </p>
              </div>

              {index === 0 ? (
                <div className="rounded-2xl bg-secondary/70 p-4">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Most booked
                  </p>
                  <p className="mt-2 text-sm leading-snug font-medium">
                    Screen replacement, battery swap & charging-port repairs.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    Browse smartphone fixes
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary">
                  Explore
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              )}
            </Link>
          ))}

          <div className="surface-card relative flex flex-col justify-between gap-6 overflow-hidden bg-primary p-5 text-primary-foreground">
            <div>
              <span className="grid size-11 place-items-center rounded-2xl bg-white/12">
                <ArrowUpRight className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-base font-semibold">
                Not sure what is wrong?
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-primary-foreground/70">
                Describe the problem and a technician will diagnose it before
                any work starts.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-bold text-accent-foreground"
            >
              Get a diagnosis
              <ArrowUpRight className="size-3.5" />
            </Link>
            <div className="pointer-events-none absolute -right-10 -bottom-12 size-32 rounded-full bg-white/10 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
