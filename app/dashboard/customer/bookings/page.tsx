"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  Download,
  Eye,
  Loader2,
  ReceiptText,
  RotateCcw,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  JobTimeline,
  JobTimelineCompact,
} from "@/components/dashboard/job-timeline";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableCard, TableSkeleton } from "@/components/dashboard/table-card";
import { ServiceMedia } from "@/components/services/service-media";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/use-api";
import { apiRequest, downloadInvoice } from "@/lib/client-api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export default function CustomerBookingsPage() {
  const { data, loading, error, refresh } = useApi<{ bookings: Booking[] }>(
    "/api/bookings/my"
  );
  const [filter, setFilter] = React.useState<string>("all");
  const [cancelTarget, setCancelTarget] = React.useState<Booking | null>(null);
  const [payTarget, setPayTarget] = React.useState<Booking | null>(null);
  const [timelineTarget, setTimelineTarget] = React.useState<Booking | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [cancelling, setCancelling] = React.useState(false);
  const [reviewTarget, setReviewTarget] = React.useState<Booking | null>(null);
  const [rating, setRating] = React.useState(1);
  const [reviewText, setReviewText] = React.useState("");
  const [reviewing, setReviewing] = React.useState(false);
  const [invoiceId, setInvoiceId] = React.useState<string | null>(null);

  const bookings = data?.bookings ?? [];
  const filtered =
    filter === "all" ? bookings : bookings.filter((item) => item.status === filter);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await apiRequest(`/api/bookings/${cancelTarget._id}/cancel`, {
        method: "PATCH",
      });
      toast.success("Booking cancelled.");
      setCancelTarget(null);
      refresh();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not cancel booking.");
    } finally {
      setCancelling(false);
    }
  }

  function openReview(booking: Booking) {
    setReviewTarget(booking);
    setRating(booking.rating ?? 1);
    setReviewText(booking.review ?? "");
  }

  async function handleReview() {
    if (!reviewTarget) return;
    if (reviewText.trim().length < 3) {
      toast.error("Write at least a few words about the repair.");
      return;
    }

    setReviewing(true);
    try {
      await apiRequest(`/api/bookings/${reviewTarget._id}/review`, {
        method: "POST",
        body: { rating, review: reviewText.trim() },
      });
      toast.success("Thanks for your review — it now shows on the service.");
      setReviewTarget(null);
      refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not submit the review."
      );
    } finally {
      setReviewing(false);
    }
  }

  async function handleInvoice(booking: Booking) {
    setInvoiceId(booking._id);
    try {
      await downloadInvoice({ bookingId: booking._id });
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not download the invoice."
      );
    } finally {
      setInvoiceId(null);
    }
  }

  async function handlePay(booking: Booking) {
    setBusyId(booking._id);
    try {
      const result = await apiRequest<{ url: string }>(
        "/api/payments/create-checkout-session",
        { method: "POST", body: { bookingId: booking._id } }
      );
      if (!result.url) throw new Error("Stripe did not return a checkout URL.");
      window.location.assign(result.url);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not start checkout."
      );
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="My bookings"
        description="Every repair request you have sent — cancel while pending, track progress, and pay only when the job is completed."
        actions={
          <Button className="rounded-full" render={<Link href="/services" />}>
            New request
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((option) => {
          const count =
            option.value === "all"
              ? bookings.length
              : bookings.filter((item) => item.status === option.value).length;
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

      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RotateCcw className="size-3.5" />
            Retry
          </Button>
        </div>
      )}

      <TableCard>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <ReceiptText className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold">
              {bookings.length === 0 ? "No bookings yet" : "Nothing in this status"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {bookings.length === 0
                ? "Send your first repair request from the services page."
                : "Try a different status filter."}
            </p>
            {bookings.length === 0 && (
              <Button
                size="sm"
                className="mt-4 rounded-full"
                render={<Link href="/services" />}
              >
                Browse services
              </Button>
            )}
          </div>
        ) : (
          <>
            <table className="hidden w-full min-w-[1080px] text-sm lg:table">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40 text-left text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  <th className="px-5 py-3">Service</th>
                  <th className="px-3 py-3">Technician</th>
                  <th className="px-3 py-3">Preferred date</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="w-[190px] px-3 py-3">Progress</th>
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
                          <p className="max-w-[210px] truncate text-sm font-semibold">
                            {booking.serviceTitle}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {booking.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs">{booking.technicianName}</td>
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
                      {booking.rating ? (
                        <div className="mt-1">
                          <StarRating value={booking.rating} showValue={false} />
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <JobTimelineCompact booking={booking} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-full text-muted-foreground"
                          aria-label="Track job"
                          onClick={() => setTimelineTarget(booking)}
                        >
                          <Eye className="size-3.5" />
                        </Button>

                        {booking.status === "requested" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-destructive"
                            onClick={() => setCancelTarget(booking)}
                          >
                            Cancel
                          </Button>
                        )}

                        {booking.status === "completed" &&
                          booking.paymentStatus === "unpaid" && (
                            <Button
                              size="sm"
                              className="rounded-full"
                              disabled={busyId === booking._id}
                              onClick={() => setPayTarget(booking)}
                            >
                              {busyId === booking._id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <CreditCard className="size-3.5" />
                              )}
                              Pay now
                            </Button>
                          )}

                        {booking.status === "completed" &&
                          booking.paymentStatus === "paid" && (
                            <>
                              {!booking.rating && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full"
                                  onClick={() => openReview(booking)}
                                >
                                  <Star className="size-3.5" />
                                  Review
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                disabled={invoiceId === booking._id}
                                onClick={() => handleInvoice(booking)}
                              >
                                {invoiceId === booking._id ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Download className="size-3.5" />
                                )}
                                Invoice
                              </Button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-border/70 lg:hidden">
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
                      <p className="text-sm font-semibold">{booking.serviceTitle}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CalendarDays className="size-3" />
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
                    <span className="text-[10px] text-muted-foreground">
                      {booking.technicianName}
                    </span>
                    {booking.rating ? (
                      <StarRating value={booking.rating} showValue={false} />
                    ) : null}
                  </div>

                  <div className="mt-3 rounded-xl border border-border/70 bg-secondary/25 px-2.5 py-2">
                    <JobTimelineCompact booking={booking} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg"
                      onClick={() => setTimelineTarget(booking)}
                    >
                      <Eye className="size-3.5" />
                      Track
                    </Button>
                    {booking.status === "requested" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg text-destructive"
                        onClick={() => setCancelTarget(booking)}
                      >
                        <X className="size-3.5" />
                        Cancel
                      </Button>
                    )}
                    {booking.status === "completed" &&
                      booking.paymentStatus === "unpaid" && (
                        <Button
                          size="sm"
                          className="flex-1 rounded-lg"
                          disabled={busyId === booking._id}
                          onClick={() => setPayTarget(booking)}
                        >
                          {busyId === booking._id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CreditCard className="size-3.5" />
                          )}
                          Pay now
                        </Button>
                      )}
                    {booking.status === "completed" &&
                      booking.paymentStatus === "paid" && (
                        <>
                          {!booking.rating && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 rounded-lg"
                              onClick={() => openReview(booking)}
                            >
                              <Star className="size-3.5" />
                              Review
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-lg"
                            disabled={invoiceId === booking._id}
                            onClick={() => handleInvoice(booking)}
                          >
                            {invoiceId === booking._id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Download className="size-3.5" />
                            )}
                            Invoice
                          </Button>
                        </>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </TableCard>

      <Dialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this request?</DialogTitle>
            <DialogDescription>
              Your request for <strong>{cancelTarget?.serviceTitle}</strong> will
              be marked as cancelled. This cannot be undone — you would need to
              send a new request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setCancelTarget(null)}
            >
              Keep request
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {cancelling ? <Loader2 className="size-4 animate-spin" /> : null}
              Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(payTarget)}
        onOpenChange={(open) => !open && setPayTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay for this job</DialogTitle>
            <DialogDescription>
              <strong>{payTarget?.serviceTitle}</strong> ·{" "}
              {formatCurrency(payTarget?.finalAmount ?? 0)} — you are paying{" "}
              {payTarget?.technicianName} after the completed repair.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-foreground">
            <p className="font-semibold">Stripe test mode</p>
            <p className="mt-1 text-muted-foreground">
              Use test card <span className="font-mono font-semibold text-foreground">4242 4242 4242 4242</span>{" "}
              with any future date and any CVC. No real money is charged.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setPayTarget(null)}
            >
              Not now
            </Button>
            <Button
              className="rounded-full"
              disabled={busyId === payTarget?._id}
              onClick={() => payTarget && handlePay(payTarget)}
            >
              {busyId === payTarget?._id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Continue to Stripe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(timelineTarget)}
        onOpenChange={(open) => !open && setTimelineTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Job timeline</DialogTitle>
            <DialogDescription>
              {timelineTarget?.serviceTitle} · {timelineTarget?.technicianName}
            </DialogDescription>
          </DialogHeader>
          {timelineTarget && <JobTimeline booking={timelineTarget} />}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(reviewTarget)}
        onOpenChange={(open) => !open && setReviewTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate this repair</DialogTitle>
            <DialogDescription>
              How did <strong>{reviewTarget?.technicianName}</strong> handle{" "}
              {reviewTarget?.serviceTitle}? Your rating appears on the service page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold">Your rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    onClick={() => setRating(star)}
                    className="rounded-md p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "size-7",
                        star <= rating
                          ? "fill-amber-500 text-amber-500"
                          : "fill-transparent text-border"
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-semibold text-muted-foreground">
                  {rating}/5
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="booking-review"
                className="mb-1.5 block text-xs font-semibold"
              >
                Short review
              </label>
              <textarea
                id="booking-review"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Punctual, explained the fault, and the repair still works perfectly."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
              />
              <p className="mt-1 text-right text-[10px] text-muted-foreground">
                {reviewText.length}/500
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setReviewTarget(null)}
            >
              Later
            </Button>
            <Button
              className="rounded-full"
              disabled={reviewing}
              onClick={handleReview}
            >
              {reviewing ? <Loader2 className="size-4 animate-spin" /> : null}
              Publish review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
