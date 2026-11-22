import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
  Wallet,
  Wrench,
} from "lucide-react";

import { ServiceMedia } from "@/components/services/service-media";
import { RequestRepair } from "@/components/services/request-repair";
import { CategoryIcon } from "@/components/shared/category-icon";
import { ProBadge } from "@/components/shared/pro-badge";
import { StarRating } from "@/components/shared/star-rating";
import { ServiceCard } from "@/components/services/service-card";
import { getService, getServiceReviews, getServices } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    notFound();
  }

  const related = await getServices({
    category: service.category,
    limit: 3,
    sort: "newest",
  });
  const relatedServices = related.services
    .filter((item) => item._id !== service._id)
    .slice(0, 3);
  const reviews = await getServiceReviews(id);

  const included = [
    "Diagnosis confirmed before any billable work starts",
    "Genuine or verified replacement parts when needed",
    `Service handled as a ${service.serviceMode.toLowerCase()}`,
    "Final amount confirmed by the technician on completion",
  ];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(55%_100%_at_50%_0%,color-mix(in_oklch,var(--accent)_12%,transparent),transparent)]" />

      <div className="shell pt-8 pb-16 sm:pt-10">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="hover:text-foreground">
            Services
          </Link>
          <span>/</span>
          <Link
            href={`/services?category=${encodeURIComponent(service.category)}`}
            className="hover:text-foreground"
          >
            {service.category}
          </Link>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
          <div>
            <div className="surface-card overflow-hidden p-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-secondary">
                <ServiceMedia
                  service={service}
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  priority
                  showLabel
                />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <CategoryIcon category={service.category} className="size-3.5" />
                  {service.category}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  Admin approved
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
                  <StarRating
                    value={service.ratingAverage ?? 0}
                    count={service.ratingCount}
                    starClassName="size-3.5"
                  />
                </span>
                {service.technicianPlan === "pro" && (
                  <ProBadge className="px-2.5 py-1 text-[11px]" />
                )}
              </div>

              <h1 className="section-title mt-4">{service.title}</h1>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {service.description}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Wallet,
                    label: "Starting price",
                    value: formatCurrency(service.basePrice),
                  },
                  {
                    icon: Clock3,
                    label: "Estimated duration",
                    value: service.estimatedDuration,
                  },
                  {
                    icon: MapPin,
                    label: "Service mode",
                    value: service.serviceMode,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/80 bg-card p-4"
                  >
                    <item.icon className="size-4 text-primary" />
                    <p className="mt-2.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-border/80 bg-card p-5">
                <h2 className="font-heading text-base font-semibold">
                  What this service covers
                </h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-500/12 text-emerald-600">
                        <Check className="size-2.5" strokeWidth={3.5} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {reviews.length > 0 && (
                <div className="mt-6 rounded-2xl border border-border/80 bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-heading text-base font-semibold">
                      Customer reviews
                    </h2>
                    <StarRating
                      value={service.ratingAverage ?? 0}
                      count={service.ratingCount}
                      starClassName="size-3.5"
                    />
                  </div>
                  <ul className="mt-4 divide-y divide-border/70">
                    {reviews.slice(0, 4).map((review) => (
                      <li key={review._id} className="py-3.5 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold">
                            {review.customerName}
                          </p>
                          <span className="flex items-center gap-2">
                            <StarRating
                              value={review.rating}
                              showValue={false}
                              starClassName="size-3"
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {review.reviewedAt ? formatDate(review.reviewedAt) : ""}
                            </span>
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {review.review}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[10px] text-muted-foreground">
                    Only customers with a completed, paid repair can leave a review.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="surface-card p-5">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Starting from
                  </p>
                  <p className="mt-1 font-heading text-3xl font-bold">
                    {formatCurrency(service.basePrice)}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  Pay after service
                </span>
              </div>

              <div className="mt-5 space-y-2.5 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                <p className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> Service area
                  </span>
                  <span className="font-medium text-foreground">
                    {service.serviceArea}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Wrench className="size-3.5" /> Mode
                  </span>
                  <span className="font-medium text-foreground">
                    {service.serviceMode}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="size-3.5" /> Duration
                  </span>
                  <span className="font-medium text-foreground">
                    {service.estimatedDuration}
                  </span>
                </p>
              </div>

              <div className="mt-5">
                <RequestRepair service={service} />
              </div>

              <p className="mt-3 text-center text-[10px] leading-relaxed text-muted-foreground">
                No advance payment. The final amount is set by the technician
                when the job is completed, then paid securely via Stripe.
              </p>
            </div>

            <div className="surface-card mt-4 p-5">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Your technician
              </p>
              <div className="mt-3 flex items-center gap-3">
                {service.technicianImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.technicianImage}
                    alt={service.technicianName}
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-12 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {service.technicianName
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                    {service.technicianName}
                    {service.technicianPlan === "pro" ? (
                      <ProBadge />
                    ) : (
                      <ShieldCheck className="size-4 text-primary" />
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {service.technicianArea || service.serviceArea}
                  </p>
                </div>
              </div>
              {service.technicianBio && (
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {service.technicianBio}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/70 px-3 py-2 text-[11px]">
                <span className="text-muted-foreground">Typical response</span>
                <span className="font-semibold">Within 1 hour</span>
              </div>
            </div>

            <Link
              href="/services"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to all services
            </Link>
          </aside>
        </div>

        {relatedServices.length > 0 && (
          <div className="mt-16 border-t border-border/70 pt-10">
            <h2 className="font-heading text-2xl font-semibold">
              More {service.category} services
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((item) => (
                <ServiceCard key={item._id} service={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
