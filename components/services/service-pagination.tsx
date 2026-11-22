import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function ServicePagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== "page") search.set(key, value);
    }
    if (target > 1) search.set("page", String(target));
    const qs = search.toString();
    return qs ? `/services?${qs}` : "/services";
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (target) =>
      target === 1 ||
      target === totalPages ||
      Math.abs(target - page) <= 1
  );

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
    >
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-semibold transition-colors hover:bg-secondary",
          page === 1 && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft className="size-3.5" />
        Prev
      </Link>

      {pages.map((target, index) => {
        const previous = pages[index - 1];
        const showGap = previous && target - previous > 1;
        return (
          <span key={target} className="flex items-center gap-1.5">
            {showGap && (
              <span className="px-1 text-xs text-muted-foreground">…</span>
            )}
            <Link
              href={hrefFor(target)}
              aria-current={target === page ? "page" : undefined}
              className={cn(
                "grid size-9 place-items-center rounded-full border text-xs font-semibold transition-colors",
                target === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-secondary"
              )}
            >
              {target}
            </Link>
          </span>
        );
      })}

      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-semibold transition-colors hover:bg-secondary",
          page === totalPages && "pointer-events-none opacity-40"
        )}
      >
        Next
        <ChevronRight className="size-3.5" />
      </Link>
    </nav>
  );
}
