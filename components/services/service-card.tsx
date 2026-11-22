import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, Wrench } from "lucide-react";

import { CategoryIcon } from "@/components/shared/category-icon";
import { ProBadge } from "@/components/shared/pro-badge";
import { StarRating } from "@/components/shared/star-rating";
import { ServiceMedia } from "@/components/services/service-media";
import { formatCurrency } from "@/lib/format";
import type { Service } from "@/lib/types";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group surface-card hover-lift flex h-full flex-col overflow-hidden">
      <Link
        href={`/services/${service._id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-secondary"
      >
        <ServiceMedia
          service={service}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.04]"
          showLabel
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
          <CategoryIcon category={service.category} className="size-3.5" />
          {service.category}
        </span>
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary/95 px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-sm">
          {formatCurrency(service.basePrice)}
          <span className="text-[9px] font-medium opacity-80">/ starting</span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg leading-snug font-semibold">
            <Link
              href={`/services/${service._id}`}
              className="decoration-accent/60 underline-offset-4 hover:underline"
            >
              {service.title}
            </Link>
          </h3>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Wrench className="size-3" />
            {service.serviceMode}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" />
            {service.serviceArea}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3" />
            {service.estimatedDuration}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {service.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {service.technicianName
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">
                {service.technicianName}
              </p>
              <span className="flex flex-wrap items-center gap-1.5">
                <StarRating
                  value={service.ratingAverage ?? 0}
                  count={service.ratingCount}
                  starClassName="size-2.5"
                />
                {service.technicianPlan === "pro" && (
                  <ProBadge className="px-1.5 py-0" label="Pro" />
                )}
              </span>
            </div>
          </div>
          <Link
            href={`/services/${service._id}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
          >
            Details
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
