"use client";

import * as React from "react";
import {
  CalendarCheck,
  Eye,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";

import { JobTimeline } from "@/components/dashboard/job-timeline";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableCard, TableSkeleton } from "@/components/dashboard/table-card";
import { ServiceMedia } from "@/components/services/service-media";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/use-api";
import { formatCurrency, formatDate, relativeTime } from "@/lib/format";
import { BOOKING_STATUS_LABEL } from "@/lib/status";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export default function AdminBookingsPage() {
  const { data, loading, error, refresh } = useApi<{ bookings: Booking[] }>(
    "/api/admin/bookings"
  );
  const [filter, setFilter] = React.useState<FilterValue>("all");
  const [query, setQuery] = React.useState("");
  const [details, setDetails] = React.useState<Booking | null>(null);

  const bookings = data?.bookings ?? [];
  const filtered = bookings.filter((booking) => {
    const matchesStatus = filter === "all" || booking.status === filter;
    const term = query.trim().toLowerCase();
    const matchesQuery =
      !term ||
      booking.serviceTitle.toLowerCase().includes(term) ||
      booking.customerName.toLowerCase().includes(term) ||
      booking.technicianName.toLowerCase().includes(term);
    return matchesStatus && matchesQuery;
  });

  const completed = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;
  const unpaid = bookings.filter(
    (booking) => booking.status === "completed" && booking.paymentStatus === "unpaid"
  ).length;

  return (
    <div>
      <PageHeader
        title="All bookings"
        description="A read-only view of every repair request on the platform. Status changes stay with the assigned technician and the customer."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold text-primary">
            <ShieldCheck className="size-3" />
            Oversight
          </span>
        }
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RotateCcw className="size-3.5" />
            Retry
          </Button>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total bookings", value: bookings.length },
          { label: "Completed jobs", value: completed },
          { label: "Completed but unpaid", value: unpaid },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border/80 bg-card px-4 py-3"
          >
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {item.label}
            </p>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums">
              {loading ? "—" : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((option) => {
            const count =
              option.value === "all"
                ? bookings.length
                : bookings.filter(
                    (booking) => booking.status === option.value
                  ).length;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                )}
              >
                {option.label}
                <span className="ml-1.5 opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 sm:w-64">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="sr-only">Search bookings</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Service, customer or technician…"
            className="h-full w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/70"
          />
        </label>
      </div>

      <TableCard>
        {loading ? (
          <TableSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <CalendarCheck className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold">No bookings found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different status filter or clear the search.
            </p>
          </div>
        ) : (
          <>
            <table className="hidden w-full min-w-[1000px] text-sm md:table">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40 text-left text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  <th className="px-5 py-3">Service</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Technician</th>
                  <th className="px-3 py-3">Preferred</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-5 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.map((booking) => (
                  <tr key={booking._id} className="hover:bg-secondary/25">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                          <ServiceMedia
                            service={{
                              image: booking.serviceImage,
                              category: booking.category,
                              title: booking.serviceTitle,
                            }}
                            sizes="40px"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-[200px] truncate text-sm font-semibold">
                            {booking.serviceTitle}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {booking.category} ·{" "}
                            {relativeTime(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-medium">
                        {booking.customerName}
                      </p>
                      <p className="max-w-[140px] truncate text-[10px] text-muted-foreground">
                        {booking.customerEmail}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-medium">
                        {booking.technicianName}
                      </p>
                      <p className="max-w-[140px] truncate text-[10px] text-muted-foreground">
                        {booking.technicianEmail}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {formatDate(booking.preferredDate)}
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-sm font-semibold">
                        {formatCurrency(
                          booking.status === "completed"
                            ? booking.finalAmount
                            : booking.basePrice
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {booking.status === "completed" ? "Final" : "Base"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-3 py-3">
                      <PaymentStatusBadge status={booking.paymentStatus} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full"
                        aria-label="View booking"
                        onClick={() => setDetails(booking)}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-border/70 md:hidden">
              {filtered.map((booking) => (
                <button
                  key={booking._id}
                  type="button"
                  onClick={() => setDetails(booking)}
                  className="block w-full p-4 text-left transition-colors hover:bg-secondary/30"
                >
                  <div className="flex gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-secondary">
                      <ServiceMedia
                        service={{
                          image: booking.serviceImage,
                          category: booking.category,
                          title: booking.serviceTitle,
                        }}
                        sizes="48px"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {booking.serviceTitle}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {booking.customerName} · {booking.technicianName}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(
                        booking.status === "completed"
                          ? booking.finalAmount
                          : booking.basePrice
                      )}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <BookingStatusBadge status={booking.status} />
                    <PaymentStatusBadge status={booking.paymentStatus} />
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(booking.preferredDate)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </TableCard>

      <Dialog
        open={Boolean(details)}
        onOpenChange={(open) => !open && setDetails(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{details?.serviceTitle}</DialogTitle>
            <DialogDescription>
              {details ? BOOKING_STATUS_LABEL[details.status] : ""} · created{" "}
              {details ? relativeTime(details.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>

          {details && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <BookingStatusBadge status={details.status} />
                <PaymentStatusBadge status={details.paymentStatus} />
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold">
                  {formatCurrency(
                    details.status === "completed"
                      ? details.finalAmount
                      : details.basePrice
                  )}
                </span>
              </div>

              <div className="grid gap-2 rounded-2xl border border-border/80 bg-card p-4 text-xs">
                <p className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="truncate font-medium">
                    {details.customerName}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Customer email</span>
                  <span className="truncate font-medium">
                    {details.customerEmail}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{details.customerPhone}</span>
                </p>
                <p className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-muted-foreground">Address</span>
                  <span className="text-right font-medium">
                    {details.address}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Technician</span>
                  <span className="truncate font-medium">
                    {details.technicianName}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Preferred date</span>
                  <span className="font-medium">
                    {formatDate(details.preferredDate)}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-secondary/50 p-4">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Reported problem
                </p>
                <p className="mt-1.5 text-xs leading-relaxed">
                  {details.problemDescription}
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-4">
                <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Timeline
                </p>
                <JobTimeline booking={details} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
