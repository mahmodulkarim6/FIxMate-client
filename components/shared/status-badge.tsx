import { Badge } from "@/components/ui/badge";
import {
  APPROVAL_STATUS_LABEL,
  APPROVAL_STATUS_STYLES,
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
} from "@/lib/status";
import type { ApprovalStatus, BookingStatus, PaymentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        BOOKING_STATUS_STYLES[status],
        className
      )}
    >
      <span className="mr-1 size-1.5 rounded-full bg-current" />
      {BOOKING_STATUS_LABEL[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        PAYMENT_STATUS_STYLES[status],
        className
      )}
    >
      {status === "paid" ? "Paid" : "Unpaid"}
    </Badge>
  );
}

export function ApprovalStatusBadge({
  status,
  className,
}: {
  status: ApprovalStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        APPROVAL_STATUS_STYLES[status],
        className
      )}
    >
      {APPROVAL_STATUS_LABEL[status]}
    </Badge>
  );
}
