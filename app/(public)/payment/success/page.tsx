"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/client-api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Payment } from "@/lib/types";

function SuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = React.useState<
    "verifying" | "paid" | "pending" | "error"
  >("verifying");
  const [payment, setPayment] = React.useState<Payment | null>(null);
  const [message, setMessage] = React.useState("");
  const isPro = payment?.type === "subscription";

  const verify = React.useCallback(async () => {
    if (!sessionId) {
      setState("error");
      setMessage("No checkout session was provided in the URL.");
      return;
    }
    setState("verifying");
    try {
      const result = await apiRequest<{ payment: Payment }>(
        `/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`
      );
      setPayment(result.payment);
      setState("paid");
    } catch (cause) {
      const text =
        cause instanceof Error ? cause.message : "Could not verify the payment.";
      setMessage(text);
      setState(
        text.toLowerCase().includes("not completed") ? "pending" : "error"
      );
    }
  }, [sessionId]);

  React.useEffect(() => {
    void verify();
  }, [verify]);

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-14">
      <div className="surface-card w-full max-w-lg overflow-hidden">
        {state === "verifying" && (
          <div className="p-10 text-center">
            <Loader2 className="mx-auto size-10 animate-spin text-primary" />
            <h1 className="mt-5 font-heading text-xl font-bold">
              Verifying your payment
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We are confirming the Stripe checkout and writing your receipt.
              This takes a moment.
            </p>
          </div>
        )}

        {state === "paid" && payment && (
          <div>
            <div className="relative overflow-hidden bg-primary px-6 py-8 text-center text-primary-foreground">
              <div className="dotted-bg pointer-events-none absolute inset-0 opacity-[0.12]" />
              <span className="relative mx-auto grid size-14 place-items-center rounded-full bg-emerald-400/20 text-emerald-200">
                <CheckCircle2 className="size-8" />
              </span>
              <h1 className="relative mt-4 font-heading text-2xl font-bold">
                {isPro ? "You are now Verified Pro" : "Payment successful"}
              </h1>
              <p className="relative mt-1.5 text-sm text-primary-foreground/75">
                {isPro
                  ? "Unlimited listings and the Verified Pro badge are live on your account."
                  : "Your repair is paid — the technician has been notified."}
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-border/80 bg-card p-4">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Amount paid
                </p>
                <p className="mt-1 font-heading text-3xl font-bold">
                  {formatCurrency(payment.amount)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {payment.serviceTitle}
                </p>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {isPro ? "Account" : "Technician"}
                  </span>
                  <span className="font-medium">{payment.technicianName}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Paid on</span>
                  <span className="font-medium">
                    {formatDateTime(payment.paidAt)}
                  </span>
                </li>
                <li className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-muted-foreground">
                    Transaction
                  </span>
                  <code className="max-w-[220px] truncate rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">
                    {payment.transactionId}
                  </code>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="size-3.5" />
                    Paid via Stripe
                  </span>
                </li>
              </ul>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1 rounded-full"
                  render={
                    <Link
                      href={
                        isPro
                          ? "/dashboard/technician/my-services"
                          : "/dashboard/customer/bookings"
                      }
                    />
                  }
                >
                  {isPro ? "Manage my listings" : "Back to my bookings"}
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  render={
                    <Link
                      href={
                        isPro
                          ? "/dashboard/technician"
                          : "/dashboard/customer/payments"
                      }
                    />
                  }
                >
                  <ReceiptText className="size-4" />
                  {isPro ? "Technician dashboard" : "Payment history"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {state === "pending" && (
          <div className="p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-amber-500/12 text-amber-600">
              <Clock3 className="size-7" />
            </span>
            <h1 className="mt-4 font-heading text-xl font-bold">
              Payment not completed yet
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Stripe has not confirmed this checkout. If money left your account,
              wait a minute and refresh — the webhook may still be processing.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button className="rounded-full" onClick={() => void verify()}>
                Check again
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                render={<Link href="/dashboard/customer/bookings" />}
              >
                My bookings
              </Button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-rose-500/12 text-rose-600">
              <AlertCircle className="size-7" />
            </span>
            <h1 className="mt-4 font-heading text-xl font-bold">
              We could not verify this payment
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button className="rounded-full" onClick={() => void verify()}>
                Try again
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                render={<Link href="/dashboard/customer/bookings" />}
              >
                Back to bookings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="shell flex min-h-[70vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessInner />
    </React.Suspense>
  );
}
