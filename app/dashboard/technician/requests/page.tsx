"use client";

import * as React from "react";
import {
  CheckCheck,
  Eye,
  Loader2,
  MapPin,
  Phone,
  Play,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  CalendarDays,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApi } from "@/hooks/use-api";
import { apiRequest } from "@/lib/client-api";
import { formatCurrency, formatDate, relativeTime } from "@/lib/format";
import { BOOKING_STATUS_LABEL } from "@/lib/status";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "requested", label: "New requests" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export default function TechnicianRequestsPage() {
  const { data, loading, error, refresh } = useApi<{ bookings: Booking[] }>(
    "/api/technician/bookings"
  );
  const [filter, setFilter] = React.useState<FilterValue>("all");
  const [details, setDetails] = React.useState<Booking | null>(null);
  const [completeTarget, setCompleteTarget] = React.useState<Booking | null>(
    null
  );
  const [finalAmount, setFinalAmount] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [completing, setCompleting] = React.useState(false);

  const bookings = data?.bookings ?? [];
  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  async function changeStatus(
    booking: Booking,
    status: "accepted" | "rejected" | "in-progress"
  ) {
    setBusyId(booking._id);
    try {
      await apiRequest(`/api/bookings/${booking._id}/status`, {
        method: "PATCH",
        body: { status },
      });
      toast.success(
        status === "accepted"
          ? "Request accepted — the customer can see it now."
          : status === "rejected"
            ? "Request rejected."
            : "Work started. The customer can follow along."
      );
      refresh();
      setDetails(null);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not update the request."
      );
    } finally {
      setBusyId(null);
    }
  }

  function openComplete(booking: Booking) {
    setCompleteTarget(booking);
    setFinalAmount(
      booking.finalAmount
        ? String(booking.finalAmount)
        : String(booking.basePrice)
    );
  }

  async function handleComplete() {
    if (!completeTarget) return;
    const amount = Number(finalAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter the final amount charged for this repair.");
      return;
    }

    setCompleting(true);
    try {
      await apiRequest(`/api/bookings/${completeTarget._id}/status`, {
        method: "PATCH",
        body: { status: "completed", finalAmount: amount },
      });
      toast.success("Job completed — payment is now unlocked for the customer.");
      setCompleteTarget(null);
      setDetails(null);
      refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not complete the job."
      );
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Manage requests"
        description="Accept new jobs, move them through the pipeline, and set the final amount only when the repair is actually done."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
            <Inbox className="size-3" />
            {bookings.filter((booking) => booking.status === "requested").length}{" "}
            new
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

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((option) => {
          const count =
            option.value === "all"
              ? bookings.length
              : bookings.filter((booking) => booking.status === option.value)
                  .length;
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

      <TableCard>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <Inbox className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold">
              {bookings.length === 0
                ? "No requests yet"
                : "Nothing in this status"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {bookings.length === 0
                ? "New booking requests land here the moment a customer sends one."
                : "Switch to another status to see more jobs."}
            </p>
          </div>
        ) : (
          <>
            <table className="hidden w-full min-w-[980px] text-sm md:table">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40 text-left text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  <th className="px-5 py-3">Service</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Preferred</th>
                  <th className="px-3 py-3">Problem</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-5 py-3 text-right">Actions</th>
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
                          <p className="max-w-[220px] truncate text-sm font-semibold">
                            {booking.serviceTitle}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {relativeTime(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-medium">
                        {booking.customerName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {booking.customerPhone}
                      </p>
                      <p
                        className="max-w-[180px] truncate text-[10px] text-muted-foreground"
                        title={booking.address}
                      >
                        {booking.address}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {formatDate(booking.preferredDate)}
                    </td>
                    <td className="px-3 py-3">
                      <p
                        className="line-clamp-2 max-w-[220px] text-xs text-muted-foreground"
                        title={booking.problemDescription}
                      >
                        {booking.problemDescription}
                      </p>
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
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-full"
                          aria-label="View details"
                          onClick={() => setDetails(booking)}
                        >
                          <Eye className="size-3.5" />
                        </Button>

                        {booking.status === "requested" && (
                          <>
                            <Button
                              size="sm"
                              className="rounded-full"
                              disabled={busyId === booking._id}
                              onClick={() => changeStatus(booking, "accepted")}
                            >
                              {busyId === booking._id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <ThumbsUp className="size-3.5" />
                              )}
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full text-destructive"
                              disabled={busyId === booking._id}
                              onClick={() => changeStatus(booking, "rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {booking.status === "accepted" && (
                          <Button
                            size="sm"
                            className="rounded-full"
                            disabled={busyId === booking._id}
                            onClick={() => changeStatus(booking, "in-progress")}
                          >
                            <Play className="size-3.5" />
                            Start work
                          </Button>
                        )}

                        {booking.status === "in-progress" && (
                          <Button
                            size="sm"
                            className="rounded-full"
                            onClick={() => openComplete(booking)}
                          >
                            <CheckCheck className="size-3.5" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-border/70 md:hidden">
              {filtered.map((booking) => (
                <div key={booking._id} className="p-4">
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
                        {booking.customerName} ·{" "}
                        {formatDate(booking.preferredDate)}
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
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg"
                      onClick={() => setDetails(booking)}
                    >
                      <Eye className="size-3.5" />
                      Details
                    </Button>

                    {booking.status === "requested" && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 rounded-lg"
                          disabled={busyId === booking._id}
                          onClick={() => changeStatus(booking, "accepted")}
                        >
                          <ThumbsUp className="size-3.5" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-destructive"
                          disabled={busyId === booking._id}
                          onClick={() => changeStatus(booking, "rejected")}
                        >
                          <ThumbsDown className="size-3.5" />
                        </Button>
                      </>
                    )}

                    {booking.status === "accepted" && (
                      <Button
                        size="sm"
                        className="flex-1 rounded-lg"
                        disabled={busyId === booking._id}
                        onClick={() => changeStatus(booking, "in-progress")}
                      >
                        <Play className="size-3.5" />
                        Start work
                      </Button>
                    )}

                    {booking.status === "in-progress" && (
                      <Button
                        size="sm"
                        className="flex-1 rounded-lg"
                        onClick={() => openComplete(booking)}
                      >
                        <CheckCheck className="size-3.5" />
                        Mark completed
                      </Button>
                    )}
                  </div>
                </div>
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
              {details ? BOOKING_STATUS_LABEL[details.status] : ""} · requested{" "}
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
                  <span className="font-medium">{details.customerName}</span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="size-3" /> Phone
                  </span>
                  <a
                    href={`tel:${details.customerPhone}`}
                    className="font-medium hover:underline"
                  >
                    {details.customerPhone}
                  </a>
                </p>
                <p className="flex items-start justify-between gap-3">
                  <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3" /> Address
                  </span>
                  <span className="text-right font-medium">
                    {details.address}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="size-3" /> Preferred date
                  </span>
                  <span className="font-medium">
                    {formatDate(details.preferredDate)}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="truncate font-medium">
                    {details.customerEmail}
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
                  Job timeline
                </p>
                <JobTimeline booking={details} />
              </div>

              {details.status === "requested" && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1 rounded-full"
                    disabled={busyId === details._id}
                    onClick={() => changeStatus(details, "accepted")}
                  >
                    <ThumbsUp className="size-4" />
                    Accept request
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full text-destructive"
                    disabled={busyId === details._id}
                    onClick={() => changeStatus(details, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              )}

              {details.status === "accepted" && (
                <Button
                  className="w-full rounded-full"
                  disabled={busyId === details._id}
                  onClick={() => changeStatus(details, "in-progress")}
                >
                  <Play className="size-4" />
                  Start work
                </Button>
              )}

              {details.status === "in-progress" && (
                <Button
                  className="w-full rounded-full"
                  onClick={() => openComplete(details)}
                >
                  <CheckCheck className="size-4" />
                  Mark as completed
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(completeTarget)}
        onOpenChange={(open) => !open && setCompleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete this job</DialogTitle>
            <DialogDescription>
              Set the final amount you are charging for{" "}
              <strong>{completeTarget?.serviceTitle}</strong>. This unlocks the
              customer&apos;s Pay Now button — they pay after completion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="finalAmount" className="text-xs font-semibold">
                Final amount (USD)
              </Label>
              <Input
                id="finalAmount"
                type="number"
                min={1}
                step={1}
                value={finalAmount}
                onChange={(event) => setFinalAmount(event.target.value)}
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Base price was{" "}
                {formatCurrency(completeTarget?.basePrice ?? 0)}. Parts and
                labour can be included here.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setCompleteTarget(null)}
            >
              Not yet
            </Button>
            <Button
              className="rounded-full"
              disabled={completing}
              onClick={handleComplete}
            >
              {completing ? <Loader2 className="size-4 animate-spin" /> : null}
              Complete & unlock payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
