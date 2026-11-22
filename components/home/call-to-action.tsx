import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="section pt-0">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16">
          <div className="dotted-bg pointer-events-none absolute inset-0 opacity-[0.14]" />
          <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-10 size-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase">
                <Wrench className="size-3.5 text-accent" />
                Two ways to start
              </span>
              <h2 className="mt-5 font-heading text-3xl leading-[1.08] font-bold text-balance sm:text-4xl lg:text-5xl">
                Book a repair, or list your own services.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/70 sm:text-base">
                Customers get trackable jobs and pay after completion.
                Technicians get a moderated storefront, incoming requests and a
                clean dashboard to run them.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-accent text-sm font-bold text-accent-foreground hover:bg-accent/90"
                render={<Link href="/services" />}
              >
                Book a repair
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-white/25 bg-white/5 text-sm font-semibold text-primary-foreground hover:bg-white/12 hover:text-primary-foreground dark:border-white/25 dark:bg-white/5 dark:hover:bg-white/12"
                render={<Link href="/sign-up" />}
              >
                Join as a technician
              </Button>
              <p className="text-center text-[11px] text-primary-foreground/55">
                Free to list. Admin approval keeps quality high.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
