"use client";

import * as React from "react";
import {
  CreditCard,
  DollarSign,
  ReceiptText,
  RotateCcw,
  Search,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableCard, TableSkeleton } from "@/components/dashboard/table-card";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Payment } from "@/lib/types";

export default function AdminTransactionsPage() {
  const { data, loading, error, refresh } = useApi<{
    payments: Payment[];
    total: number;
    subscriptionRevenue: number;
    serviceRevenue: number;
  }>("/api/admin/payments");
  const [query, setQuery] = React.useState("");

  const payments = data?.payments ?? [];
  const filtered = payments.filter((payment) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      payment.serviceTitle.toLowerCase().includes(term) ||
      payment.customerName.toLowerCase().includes(term) ||
      payment.technicianName.toLowerCase().includes(term) ||
      payment.transactionId.toLowerCase().includes(term)
    );
  });

  const repairPayments = payments.filter(
    (payment) => payment.type !== "subscription"
  );
  const average =
    repairPayments.length > 0
      ? repairPayments.reduce((sum, payment) => sum + payment.amount, 0) /
        repairPayments.length
      : 0;
  const thisMonth = payments
    .filter((payment) => {
      const paid = new Date(payment.paidAt);
      const now = new Date();
      return (
        paid.getMonth() === now.getMonth() &&
        paid.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Every Stripe payment collected on FixMate. Customers pay only after a technician marks a job completed."
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={refresh}
            disabled={loading}
          >
            <RotateCcw className="size-4" />
            Refresh
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
          label="Total revenue"
          value={loading ? "—" : formatCurrency(data?.total ?? 0)}
          hint={`This month: ${formatCurrency(thisMonth)}`}
          icon={DollarSign}
          tone="green"
        />
        <StatCard
          label="Repair revenue"
          value={loading ? "—" : formatCurrency(data?.serviceRevenue ?? 0)}
          hint="Stripe payments on completed jobs"
          icon={ReceiptText}
          tone="violet"
        />
        <StatCard
          label="Pro subscriptions"
          value={
            loading ? "—" : formatCurrency(data?.subscriptionRevenue ?? 0)
          }
          hint="Technician plan upgrades"
          icon={CreditCard}
          tone="amber"
        />
        <StatCard
          label="Average repair ticket"
          value={loading ? "—" : formatCurrency(average)}
          hint="Mean amount per paid repair"
          icon={TrendingUp}
        />
      </div>

      <div className="mt-5">
        <TableCard
          title="Payment ledger"
          description="Newest transactions first — transaction IDs come from Stripe"
          actions={
            <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 sm:w-64">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="sr-only">Search transactions</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Service, person or txn id…"
                className="h-full w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/70"
              />
            </label>
          }
        >
          {loading ? (
            <TableSkeleton rows={6} />
          ) : filtered.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
                <ReceiptText className="size-5" />
              </span>
              <p className="mt-4 text-sm font-semibold">
                {payments.length === 0
                  ? "No payments yet"
                  : "No matching transactions"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {payments.length === 0
                  ? "Completed jobs unlock a Pay Now button on the customer dashboard."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <>
              <table className="hidden w-full min-w-[960px] text-sm md:table">
                <thead>
                  <tr className="border-b border-border/70 bg-secondary/40 text-left text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    <th className="px-5 py-3">Service</th>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Technician</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Transaction ID</th>
                    <th className="px-5 py-3">Paid on</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {filtered.map((payment) => (
                    <tr key={payment._id} className="hover:bg-secondary/25">
                      <td className="px-5 py-3.5 font-medium">
                        <span className="flex flex-wrap items-center gap-1.5">
                          {payment.serviceTitle}
                          <span
                            className={
                              payment.type === "subscription"
                                ? "rounded-full border border-amber-500/35 bg-amber-500/12 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-800 uppercase dark:text-amber-200"
                                : "rounded-full border border-border px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-muted-foreground uppercase"
                            }
                          >
                            {payment.type === "subscription" ? "Pro plan" : "Repair"}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-xs font-medium">
                          {payment.customerName}
                        </p>
                        <p className="max-w-[150px] truncate text-[10px] text-muted-foreground">
                          {payment.customerEmail}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-xs font-medium">
                          {payment.technicianName}
                        </p>
                        <p className="max-w-[150px] truncate text-[10px] text-muted-foreground">
                          {payment.technicianEmail}
                        </p>
                      </td>
                      <td className="px-3 py-3.5 font-semibold text-emerald-700 dark:text-emerald-300">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-3 py-3.5">
                        <code className="rounded bg-secondary px-1.5 py-1 font-mono text-[10px] text-muted-foreground">
                          {payment.transactionId.slice(0, 20)}
                        </code>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {formatDateTime(payment.paidAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul className="divide-y divide-border/70 md:hidden">
                {filtered.map((payment) => (
                  <li key={payment._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {payment.serviceTitle}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {payment.type === "subscription"
                            ? "Pro plan · technician subscription"
                            : `${payment.customerName} → ${payment.technicianName}`}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 truncate font-mono text-[10px] text-muted-foreground">
                      {payment.transactionId}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDateTime(payment.paidAt)}
                    </p>
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
