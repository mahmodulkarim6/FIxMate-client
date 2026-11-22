"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Wallet,
} from "lucide-react";

import { JobsBarChart, RevenueAreaChart } from "@/components/dashboard/dashboard-charts";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableCard, TableSkeleton } from "@/components/dashboard/table-card";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CustomerStats } from "@/lib/types";

export default function CustomerOverviewPage() {
  const { data, loading, error, refresh } = useApi<CustomerStats>(
    "/api/customer/stats"
  );

  return (
    <div>
      <PageHeader
        title="Your repair overview"
        description="A quick read on active jobs, completed repairs and what you have spent so far."
        actions={
          <Button className="rounded-full" render={<Link href="/services" />}>
            Book a repair
            <ArrowRight className="size-4" />
          </Button>
        }
      />

      {error && (
        <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-xs text-destructive sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" className="rounded-full" onClick={refresh}>
            <RotateCcw className="size-3.5" />
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total requests"
          value={loading ? "—" : (data?.totalRequests ?? 0)}
          hint="Every repair request you sent"
          icon={CalendarCheck}
        />
        <StatCard
          label="Active jobs"
          value={loading ? "—" : (data?.activeJobs ?? 0)}
          hint="Requested, accepted or in progress"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Completed jobs"
          value={loading ? "—" : (data?.completedJobs ?? 0)}
          hint="Ready to pay or already paid"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Total spent"
          value={loading ? "—" : formatCurrency(data?.totalSpent ?? 0)}
          hint="Stripe payments on completed jobs"
          icon={Wallet}
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
                Where your requests stand right now
              </p>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
              All time
            </span>
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
              Spending by month
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              What you have paid after completed repairs
            </p>
          </div>
          {loading ? (
            <div className="h-[230px] animate-pulse rounded-2xl bg-secondary" />
          ) : (
            <RevenueAreaChart data={data?.spendByMonth ?? []} label="Spent" />
          )}
        </div>
      </div>

      <div className="mt-5">
        <TableCard
          title="Recent requests"
          description="The five latest bookings on your account"
          actions={
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              render={<Link href="/dashboard/customer/bookings" />}
            >
              View all
              <ArrowRight className="size-3.5" />
            </Button>
          }
        >
          {loading ? (
            <TableSkeleton rows={4} />
          ) : (data?.recentBookings?.length ?? 0) === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium">No repair requests yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Browse approved services and send your first request.
              </p>
              <Button
                size="sm"
                className="mt-4 rounded-full"
                render={<Link href="/services" />}
              >
                Browse services
              </Button>
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
                      {booking.technicianName} · {formatDate(booking.preferredDate)}
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
