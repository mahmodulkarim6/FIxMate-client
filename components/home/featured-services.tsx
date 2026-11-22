import { Wrench } from "lucide-react";

import { ServiceCard } from "@/components/services/service-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Service } from "@/lib/types";

export function FeaturedServices({ services }: { services: Service[] }) {
  return (
    <section className="section pt-0">
      <div className="shell">
        <SectionHeading
          eyebrow="Fresh on FixMate"
          title="Latest approved services"
          description="Newest listings from verified technicians — each one reviewed by an admin before it appears here."
          action={{ href: "/services", label: "Browse all services" }}
        />

        {services.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
              <Wrench className="size-6" />
            </span>
            <h3 className="mt-5 font-heading text-lg font-semibold">
              Services are being reviewed
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Approved listings will show up here. If you are a technician, sign
              up and add your first service — an admin will review it shortly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button className="rounded-full" render={<Link href="/services" />}>
                Browse services
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                render={<Link href="/sign-up" />}
              >
                Join as a technician
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
