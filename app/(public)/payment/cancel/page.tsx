import Link from "next/link";
import { ArrowLeft, RotateCcw, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payment cancelled",
  description: "Your FixMate payment was cancelled — no money was taken.",
};

export default function PaymentCancelPage() {
  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-14">
      <div className="surface-card w-full max-w-lg p-8 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-500/12 text-rose-600">
          <XCircle className="size-8" />
        </span>

        <h1 className="mt-5 font-heading text-2xl font-bold">
          Payment cancelled
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          No money was taken and your booking is unchanged. The job stays{" "}
          <strong className="text-foreground">completed but unpaid</strong>, so
          you can start the checkout again whenever you are ready.
        </p>

        <div className="mt-6 rounded-2xl border border-border/80 bg-secondary/50 p-4 text-left">
          <p className="flex items-center gap-2 text-[11px] font-semibold">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            Pay after the repair, always
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            FixMate never charges before a technician marks a job completed. If
            something looks wrong with the final amount, contact support before
            paying.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            className="rounded-full"
            render={<Link href="/dashboard/customer/bookings" />}
          >
            <RotateCcw className="size-4" />
            Try payment again
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            render={<Link href="/services" />}
          >
            <ArrowLeft className="size-4" />
            Browse services
          </Button>
        </div>
      </div>
    </div>
  );
}
