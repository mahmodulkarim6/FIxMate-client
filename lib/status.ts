import type { ApprovalStatus, BookingStatus, PaymentStatus } from "@/lib/types";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  requested:
    "border-blue-600/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  accepted:
    "border-indigo-600/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  "in-progress":
    "border-amber-600/25 bg-amber-500/15 text-amber-800 dark:text-amber-300",
  completed:
    "border-emerald-600/20 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  rejected:
    "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  cancelled:
    "border-slate-500/25 bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  unpaid:
    "border-amber-600/25 bg-amber-500/15 text-amber-800 dark:text-amber-300",
  paid: "border-emerald-600/20 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};

export const APPROVAL_STATUS_STYLES: Record<ApprovalStatus, string> = {
  pending:
    "border-amber-600/25 bg-amber-500/15 text-amber-800 dark:text-amber-300",
  approved:
    "border-emerald-600/20 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  rejected:
    "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};
