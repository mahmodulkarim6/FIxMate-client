"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORIES, SEARCH_DEBOUNCE_MS, SORT_OPTIONS, SERVICE_MODES } from "@/lib/constants";

function buildQuery(
  current: URLSearchParams,
  updates: Record<string, string | undefined>
) {
  const params = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }
  params.delete("page");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function ServiceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
  const [pending, startTransition] = React.useTransition();

  const category = searchParams.get("category") ?? "all";
  const mode = searchParams.get("mode") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";
  const hasFilters = Boolean(
    searchParams.get("search") ||
      searchParams.get("category") ||
      searchParams.get("mode") ||
      (searchParams.get("sort") && searchParams.get("sort") !== "newest")
  );

  const push = React.useCallback(
    (updates: Record<string, string | undefined>) => {
      startTransition(() => {
        router.replace(`${pathname}${buildQuery(searchParams, updates)}`, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams]
  );

  React.useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (search === current) return;
    const timeout = setTimeout(() => {
      push({ search: search || undefined });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search, searchParams, push]);

  React.useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  return (
    <div className="surface-card p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Search services</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or category…"
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:items-center">
          <label className="relative">
            <span className="sr-only">Category</span>
            <select
              value={category}
              onChange={(event) => push({ category: event.target.value })}
              className="h-11 w-full cursor-pointer rounded-xl border border-border bg-background px-3 pr-8 text-sm font-medium outline-none lg:w-40"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Service mode</span>
            <select
              value={mode}
              onChange={(event) => push({ mode: event.target.value })}
              className="h-11 w-full cursor-pointer rounded-xl border border-border bg-background px-3 pr-8 text-sm font-medium outline-none lg:w-40"
            >
              <option value="all">Any service mode</option>
              {SERVICE_MODES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="col-span-2 sm:col-span-1">
            <span className="sr-only">Sort</span>
            <select
              value={sort}
              onChange={(event) => push({ sort: event.target.value })}
              className="h-11 w-full cursor-pointer rounded-xl border border-border bg-background px-3 pr-8 text-sm font-medium outline-none lg:w-48"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center justify-between gap-2 lg:justify-end">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground lg:hidden">
            <SlidersHorizontal className="size-3.5" />
            {pending ? "Updating…" : "Server-side filters"}
          </span>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => {
                setSearch("");
                startTransition(() => router.replace(pathname, { scroll: false }));
              }}
            >
              <X className="size-3.5" />
              Clear all
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
