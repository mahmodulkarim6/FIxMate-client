import * as React from "react";
import Link from "next/link";
import { SearchX, Wrench } from "lucide-react";

import { ServiceCard } from "@/components/services/service-card";
import { ServiceFilters } from "@/components/services/service-filters";
import { ServicePagination } from "@/components/services/service-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { getServices } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse repair services",
  description:
    "Search and filter approved device and home appliance repair services from verified FixMate technicians.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = first(params.search) ?? "";
  const category = first(params.category) ?? "all";
  const mode = first(params.mode) ?? "all";
  const sort = first(params.sort) ?? "newest";
  const page = Math.max(1, Number(first(params.page) ?? 1) || 1);
  const limit = 9;

  const data = await getServices({
    search,
    category,
    mode,
    sort,
    page,
    limit,
  });

  const activeCategory =
    category !== "all" ? category : search ? `“${search}”` : null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklch,var(--accent)_13%,transparent),transparent)]" />

      <div className="shell pt-10 pb-8 sm:pt-14">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Services</span>
        </nav>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">
              <Wrench className="size-3 text-accent-foreground dark:text-accent" />
              {data.total} approved {data.total === 1 ? "service" : "services"}
            </span>
            <h1 className="section-title mt-4">
              {activeCategory
                ? `Repair services for ${activeCategory}`
                : "Browse every approved repair service"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Search, filter and sort run on the server, so the URL always
              carries your selection — reload or share it and nothing is lost.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Admin-approved & available only
          </div>
        </div>

        <div className="mt-8">
          <React.Suspense
            fallback={
              <div className="h-[76px] animate-pulse rounded-3xl border border-border bg-card/70" />
            }
          >
            <ServiceFilters />
          </React.Suspense>
        </div>

        {data.services.length > 0 ? (
          <>
            <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
              <span>
                Showing{" "}
                <strong className="text-foreground">
                  {(data.page - 1) * data.limit + 1}–
                  {Math.min(data.page * data.limit, data.total)}
                </strong>{" "}
                of {data.total}
              </span>
              <span className="capitalize">Sorted: {sort.replace("-", " ")}</span>
            </div>

            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            <ServicePagination
              page={data.page}
              totalPages={data.totalPages}
              params={{ search, category, mode, sort }}
            />
          </>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={SearchX}
              title="No services match those filters"
              description="Try a different category, switch the service mode, or clear the search. New listings appear after admin approval."
              action={{ href: "/services", label: "Reset filters" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
