"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  FilePlus2,
  RotateCcw,
  Wrench,
} from "lucide-react";

import { JobsBarChart, RevenueAreaChart } from "@/components/dashboard/dashboard-charts";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableCard, TableSkeleton } from "@/components/dashboard/table-card";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { TechnicianStats } from "@/lib/types";

export default function TechnicianOverviewPage() {
  const { data, loading, error, refresh } = useApi<TechnicianStats>(
    "/api/technician/stats"
  );

  return (
    <div>
      <PageHeader
        title="Technician overview"
        description="Your listings, incoming requests and completed work at a glance."
        badge={
          <span
            className={
              data?.plan === "pro"
                ? "inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/12 px-2.5 py-1 text-[10px] font-semibold text-amber-800 dark:text-amber-200"
                : "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"
            }
          >
            <BadgeCheck className="size-3" />
            {data?.plan === "pro" ? "Verified Pro" : "Free plan"}
          </span>
        }
        actions={
          <Button className="rounded-full" render={<Link href="/dashboard/technician/add-service" />}>
            <FilePlus2 className="size-4" />
            Add a service
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total services"
          value={loading ? "—" : (data?.totalServices ?? 0)}
          hint="All listings you created"
          icon={Wrench}
        />
        <StatCard
          label="Approved services"
          value={loading ? "—" : (data?.approvedServices ?? 0)}
          hint="Live on the public site"
          icon={BadgeCheck}
          tone="green"
        />
        <StatCard
          label="Pending requests"
          value={loading ? "—" : (data?.pendingRequests ?? 0)}
          hint="Waiting for your response"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Total earnings"
          value={loading ? "—" : formatCurrency(data?.totalEarnings ?? 0)}
          hint="Paid jobs only"
          icon={BriefcaseBusiness}
          tone="violet"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold">
                Jobs by status
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Incoming work on your services
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              render={<Link href="/dashboard/technician/requests" />}
            >
              Manage
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
          {loading ? (
            <div className="h-[230px] animate-pulse rounded-2xl bg-secondary" />
          ) : (
            <JobsBarChart data={data?.statusBreakdown ?? []} />
          )}
        </div>

        <div className="surface-card p-5">
          <div className="mb-4">
            <h2 className="font-heading text-base font-semibold">
              Earnings by month
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Paid Stripe transactions for your jobs
            </p>
          </div>
          {loading ? (
            <div className="h-[230px] animate-pulse rounded-2xl bg-secondary" />
          ) : (
            <RevenueAreaChart data={data?.earningsByMonth ?? []} label="Earned" />
          )}
        </div>
      </div>

      <div className="mt-5">
        <TableCard
          title="Recent requests"
          description="Latest bookings assigned to your services"
          actions={
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              render={<Link href="/dashboard/technician/requests" />}
            >
              All requests
              <ArrowRight className="size-3.5" />
            </Button>
          }
        >
          {loading ? (
            <TableSkeleton rows={4} />
          ) : (data?.recentBookings?.length ?? 0) === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium">No requests yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                New requests will appear here as soon as customers book one of
                your services.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {data?.recentBookings?.map((booking) => (
                <li
                  key={booking._id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {booking.serviceTitle}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {booking.customerName} ·{" "}
                      {formatDate(booking.preferredDate)}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                  <span className="w-20 text-right text-sm font-semibold">
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
