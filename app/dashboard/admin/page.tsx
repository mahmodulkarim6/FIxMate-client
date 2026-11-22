"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  DollarSign,
  ShieldCheck,
  RotateCcw,
  Users,
  Wrench,
} from "lucide-react";

import {
  CategoryDonut,
  JobsBarChart,
  RevenueAreaChart,
} from "@/components/dashboard/dashboard-charts";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableCard, TableSkeleton } from "@/components/dashboard/table-card";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { formatCurrency, formatDate, relativeTime } from "@/lib/format";
import type { AdminStats } from "@/lib/types";

export default function AdminOverviewPage() {
  const { data, loading, error, refresh } = useApi<AdminStats>(
    "/api/admin/stats"
  );

  return (
    <div>
      <PageHeader
        title="Platform overview"
        description="Users, listings, jobs and revenue across FixMate — everything an admin needs in one screen."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold text-primary">
            <ShieldCheck className="size-3" />
            Admin only
          </span>
        }
        actions={
          <Button
            className="rounded-full"
            render={<Link href="/dashboard/admin/services" />}
          >
            Review services
            {(data?.pendingServices ?? 0) > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                {data?.pendingServices}
              </span>
            )}
          </Button>
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

      {(data?.pendingServices ?? 0) > 0 && (
        <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-300">
            <Clock3 className="size-4" />
            {data?.pendingServices} service
            {data?.pendingServices === 1 ? "" : "s"} waiting for approval.
          </p>
          <Button
            size="sm"
            className="rounded-full"
            render={<Link href="/dashboard/admin/services?status=pending" />}
          >
            Review now
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={loading ? "—" : (data?.totalUsers ?? 0)}
          hint={`${data?.totalCustomers ?? 0} customers`}
          icon={Users}
        />
        <StatCard
          label="Total technicians"
          value={loading ? "—" : (data?.totalTechnicians ?? 0)}
          hint="Verified service providers"
          icon={Wrench}
          tone="violet"
        />
        <StatCard
          label="Pending services"
          value={loading ? "—" : (data?.pendingServices ?? 0)}
          hint={`${data?.totalServices ?? 0} services in total`}
          icon={CalendarCheck}
          tone="amber"
        />
        <StatCard
          label="Total revenue"
          value={loading ? "—" : formatCurrency(data?.totalRevenue ?? 0)}
          hint="Stripe payments collected"
          icon={DollarSign}
          tone="green"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-semibold">
                Revenue by month
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Paid transactions over the last six months
              </p>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
              All payments
            </span>
          </div>
          {loading ? (
            <div className="h-[230px] animate-pulse rounded-2xl bg-secondary" />
          ) : (
            <RevenueAreaChart data={data?.revenueByMonth ?? []} />
          )}
        </div>

        <div className="surface-card p-5">
          <div className="mb-4">
            <h2 className="font-heading text-base font-semibold">
              Services by category
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Where the supply sits across the platform
            </p>
          </div>
          {loading ? (
            <div className="h-[210px] animate-pulse rounded-2xl bg-secondary" />
          ) : (
            <CategoryDonut data={data?.categoryBreakdown ?? []} />
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card p-5">
          <div className="mb-4">
            <h2 className="font-heading text-base font-semibold">
              Bookings by status
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Pipeline health across all technicians
            </p>
          </div>
          {loading ? (
            <div className="h-[230px] animate-pulse rounded-2xl bg-secondary" />
          ) : (
            <JobsBarChart data={data?.bookingsByStatus ?? []} />
          )}
        </div>

        <TableCard
          title="Latest bookings"
          description="Most recent requests across every technician"
          actions={
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              render={<Link href="/dashboard/admin/bookings" />}
            >
              View all
              <ArrowRight className="size-3.5" />
            </Button>
          }
        >
          {loading ? (
            <TableSkeleton rows={4} />
          ) : (data?.recentBookings?.length ?? 0) === 0 ? (
            <div className="px-5 py-12 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
                <CheckCircle2 className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold">No bookings yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Requests will appear here as customers book services.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {data?.recentBookings?.map((booking) => (
                <li
                  key={booking._id}
                  className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {booking.serviceTitle}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {booking.customerName} → {booking.technicianName} ·{" "}
                      {formatDate(booking.preferredDate)} ·{" "}
                      {relativeTime(booking.createdAt)}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                  <span className="w-16 text-right text-sm font-semibold">
                    {formatCurrency(
                      booking.status === "completed"
                        ? booking.finalAmount
                        : booking.basePrice
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </TableCard>
      </div>
    </div>
  );
}
