"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Loader2, ReceiptText, RotateCcw, Wallet } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableCard, TableSkeleton } from "@/components/dashboard/table-card";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { downloadInvoice } from "@/lib/client-api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Payment } from "@/lib/types";

export default function CustomerPaymentsPage() {
  const { data, loading, error, refresh } = useApi<{
    payments: Payment[];
    total: number;
  }>("/api/payments/my");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const payments = data?.payments ?? [];

  async function handleInvoice(payment: Payment) {
    setBusyId(payment._id);
    try {
      await downloadInvoice({ paymentId: payment._id });
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not download the invoice."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Payment history"
        description="Payments for completed repairs. Each transaction links to the job it paid for, and every receipt downloads as a PDF invoice."
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            render={<Link href="/dashboard/customer/bookings" />}
          >
            My bookings
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Payment method"
          value="Stripe"
          hint="Test mode checkout"
          icon={Wallet}
          tone="teal"
        />
        <StatCard
          label="Transactions"
          value={loading ? "—" : payments.length}
          hint="Each job is paid exactly once"
          icon={ReceiptText}
          tone="violet"
        />
        <StatCard
          label="Total paid"
          value={loading ? "—" : formatCurrency(data?.total ?? 0)}
          hint="Across all completed jobs"
          icon={Wallet}
          tone="green"
        />
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RotateCcw className="size-3.5" />
            Retry
          </Button>
        </div>
      )}

      <div className="mt-5">
        <TableCard title="Transactions" description="Newest payments first">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : payments.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
                <ReceiptText className="size-5" />
              </span>
              <p className="mt-4 text-sm font-semibold">No payments yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Completed jobs show a Pay Now button in My Bookings.
              </p>
              <Button
                size="sm"
                className="mt-4 rounded-full"
                render={<Link href="/dashboard/customer/bookings" />}
              >
                Go to my bookings
              </Button>
            </div>
          ) : (
            <>
              <table className="hidden w-full min-w-[840px] text-sm lg:table">
                <thead>
                  <tr className="border-b border-border/70 bg-secondary/40 text-left text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    <th className="px-5 py-3">Service</th>
                    <th className="px-3 py-3">Technician</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Transaction ID</th>
                    <th className="px-3 py-3">Paid on</th>
                    <th className="px-5 py-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-secondary/25">
                      <td className="px-5 py-3.5 font-medium">
                        {payment.serviceTitle}
                      </td>
                      <td className="px-3 py-3.5 text-xs">
                        {payment.technicianName}
                      </td>
                      <td className="px-3 py-3.5 font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <code className="rounded bg-secondary px-1.5 py-1 font-mono text-[10px] text-muted-foreground">
                            {payment.transactionId.slice(0, 22)}
                          </code>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-muted-foreground">
                        {formatDateTime(payment.paidAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={busyId === payment._id}
                            onClick={() => handleInvoice(payment)}
                          >
                            {busyId === payment._id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Download className="size-3.5" />
                            )}
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul className="divide-y divide-border/70 lg:hidden">
                {payments.map((payment) => (
                  <li key={payment._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {payment.serviceTitle}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {payment.technicianName} ·{" "}
                          {formatDateTime(payment.paidAt)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 truncate font-mono text-[10px] text-muted-foreground">
                      {payment.transactionId}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full rounded-lg"
                      disabled={busyId === payment._id}
                      onClick={() => handleInvoice(payment)}
                    >
                      {busyId === payment._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Download className="size-3.5" />
                      )}
                      Download invoice
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </TableCard>
      </div>
    </div>
  );
}
