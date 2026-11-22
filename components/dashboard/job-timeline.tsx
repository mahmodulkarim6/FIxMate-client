import { Check, X } from "lucide-react";

import { BookingStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

const FLOW = ["requested", "accepted", "in-progress", "completed", "paid"] as const;

const LABELS: Record<(typeof FLOW)[number], string> = {
  requested: "Requested",
  accepted: "Accepted",
  "in-progress": "In progress",
  completed: "Completed",
  paid: "Paid",
};

/** The index of the furthest step a booking has reached. */
function currentStepIndex(booking: Booking) {
  if (booking.status === "cancelled" || booking.status === "rejected") return 0;
  if (booking.paymentStatus === "paid") return 4;
  if (booking.status === "completed") return 3;
  return Math.max(0, FLOW.indexOf(booking.status as (typeof FLOW)[number]));
}

export function JobTimeline({ booking }: { booking: Booking }) {
  const terminal =
    booking.status === "cancelled" || booking.status === "rejected";

  const currentIndex = currentStepIndex(booking);

  const history = booking.statusHistory ?? [];
  const dateFor = (status: string) =>
    history.find((entry) => entry.status === status)?.changedAt;

  if (terminal) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-4">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-rose-500/12 text-rose-600">
            <X className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">
              Request {booking.status === "rejected" ? "rejected" : "cancelled"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatDate(
                dateFor(booking.status) ?? booking.createdAt
              )} · no further changes allowed
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <BookingStatusBadge status={booking.status} />
          <span className="text-[11px] text-muted-foreground">
            Final state
          </span>
        </div>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {FLOW.map((step, index) => {
        const reached = index <= currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
            {index < FLOW.length - 1 && (
              <span
                className={cn(
                  "absolute top-6 left-[11px] h-full w-0.5",
                  reached ? "bg-primary/40" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-6 shrink-0 place-items-center rounded-full border-2",
                reached
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
                active && "ring-4 ring-primary/15"
              )}
            >
              {reached ? (
                <Check className="size-3" strokeWidth={3} />
              ) : (
                <span className="size-1.5 rounded-full bg-current" />
              )}
            </span>
            <div className="pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  reached ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {LABELS[step]}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {step === "paid"
                  ? booking.paymentStatus === "paid"
                    ? `Paid ${formatDate(booking.paidAt ?? dateFor("paid"))}`
                    : "Unlocks after completion"
                  : formatDate(dateFor(step) ?? (index === 0 ? booking.createdAt : undefined))}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * A slim horizontal version of the tracker, shown inline in My Bookings so
 * customers can see progress without opening a dialog.
 */
export function JobTimelineCompact({ booking }: { booking: Booking }) {
  const terminal =
    booking.status === "cancelled" || booking.status === "rejected";
  const currentIndex = currentStepIndex(booking);

  if (terminal) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-rose-600 dark:text-rose-300">
        <X className="size-3" />
        {booking.status === "rejected" ? "Rejected" : "Cancelled"} - no further
        changes
      </div>
    );
  }

  return (
    <ol className="flex items-start gap-0" aria-label="Job progress">
      {FLOW.map((step, index) => {
        const reached = index <= currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step} className="relative flex min-w-0 flex-1 flex-col items-center gap-1">
            {index < FLOW.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-2.5 left-1/2 h-0.5 w-full",
                  index < currentIndex ? "bg-primary/50" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-5 place-items-center rounded-full border-2",
                reached
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
                active && "ring-4 ring-primary/15"
              )}
            >
              {reached ? (
                <Check className="size-2.5" strokeWidth={3.5} />
              ) : (
                <span className="size-1 rounded-full bg-current" />
              )}
            </span>
            <span
              className={cn(
                "w-full truncate text-center text-[9px] leading-tight",
                reached ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
