"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Clock3,
  Eye,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { ServiceMedia } from "@/components/services/service-media";
import { ApprovalStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/hooks/use-api";
import { apiRequest } from "@/lib/client-api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ApprovalStatus, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All listings" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

function AdminServicesInner() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [filter, setFilter] = React.useState<FilterValue>(
    initialStatus === "pending" ||
      initialStatus === "approved" ||
      initialStatus === "rejected"
      ? initialStatus
      : "all"
  );
  const { data, loading, error, refresh } = useApi<{ services: Service[] }>(
    "/api/admin/services"
  );
  const [query, setQuery] = React.useState("");
  const [preview, setPreview] = React.useState<Service | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<Service | null>(null);
  const [reason, setReason] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [rejecting, setRejecting] = React.useState(false);

  const services = data?.services ?? [];
  const filtered = services.filter((service) => {
    const matchesStatus =
      filter === "all" || service.approvalStatus === filter;
    const term = query.trim().toLowerCase();
    const matchesQuery =
      !term ||
      service.title.toLowerCase().includes(term) ||
      service.technicianName.toLowerCase().includes(term) ||
      service.category.toLowerCase().includes(term);
    return matchesStatus && matchesQuery;
  });

  async function setApproval(service: Service, status: ApprovalStatus) {
    setBusyId(service._id);
    try {
      await apiRequest(`/api/admin/services/${service._id}/approval`, {
        method: "PATCH",
        body: { approvalStatus: status },
      });
      toast.success(
        status === "approved"
          ? "Listing approved — it is live on the services page."
          : "Listing rejected."
      );
      refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not update the listing."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await apiRequest(`/api/admin/services/${rejectTarget._id}/approval`, {
        method: "PATCH",
        body: {
          approvalStatus: "rejected",
          rejectionReason: reason.trim() || undefined,
        },
      });
      toast.success("Listing rejected. The technician can edit and resubmit.");
      setRejectTarget(null);
      setReason("");
      refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not reject the listing."
      );
    } finally {
      setRejecting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Service approval"
        description="Review every new and edited listing before it appears on the public site. Approved listings show up in search immediately."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
            <Clock3 className="size-3" />
            {
              services.filter((service) => service.approvalStatus === "pending")
                .length
            }{" "}
            pending
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

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((option) => {
            const count =
              option.value === "all"
                ? services.length
                : services.filter(
                  (service) => service.approvalStatus === option.value
                ).length;
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

        <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 sm:w-64">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="sr-only">Search listings</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, technician or category…"
            className="h-full w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/70"
          />
        </label>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <p className="mt-4 text-sm font-semibold">Nothing to review here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {services.length === 0
              ? "No service listings exist yet."
              : "Switch filters or clear the search to see other listings."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(1fr,24rem))] gap-5 max-sm:grid-cols-1">
          {filtered.map((service) => (
            <article
              key={service._id}
              className="surface-card flex h-full flex-col overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-secondary">
                <ServiceMedia
                  service={service}
                  sizes="(min-width: 640px) 384px, 92vw"
                />
                <div className="absolute top-3 left-3">
                  <ApprovalStatusBadge status={service.approvalStatus} />
                </div>
                <span className="absolute top-3 right-3 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-bold shadow-sm">
                  {formatCurrency(service.basePrice)}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {service.category} · {service.serviceMode}
                </p>
                <h3 className="mt-1.5 line-clamp-2 font-heading text-sm leading-snug font-semibold">
                  {service.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {service.description}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-[11px]">
                  <span className="truncate font-medium">
                    {service.technicianName}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatDate(service.createdAt)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => setPreview(service)}
                  >
                    <Eye className="size-3.5" />
                    View
                  </Button>
                  {service.approvalStatus !== "approved" && (
                    <Button
                      size="sm"
                      className="flex-1 rounded-lg"
                      disabled={busyId === service._id}
                      onClick={() => setApproval(service, "approved")}
                    >
                      {busyId === service._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      Approve
                    </Button>
                  )}
                  {service.approvalStatus !== "rejected" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-destructive"
                      disabled={busyId === service._id}
                      onClick={() => {
                        setRejectTarget(service);
                        setReason("");
                      }}
                    >
                      <X className="size-3.5" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>
              {preview?.category} · submitted by {preview?.technicianName} on{" "}
              {preview ? formatDate(preview.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>

          {preview && (
            <div className="space-y-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-secondary">
                <ServiceMedia service={preview} sizes="(min-width: 640px) 540px, 90vw" showLabel />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ApprovalStatusBadge status={preview.approvalStatus} />
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold">
                  {formatCurrency(preview.basePrice)} starting
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold">
                  {preview.estimatedDuration}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold">
                  {preview.isAvailable ? "Accepting requests" : "Paused"}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {preview.description}
              </p>

              <div className="grid gap-2 rounded-2xl border border-border/80 bg-card p-4 text-xs">
                <p className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Service area</span>
                  <span className="font-medium">{preview.serviceArea}</span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium">{preview.serviceMode}</span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Technician</span>
                  <span className="truncate font-medium">
                    {preview.technicianEmail}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  className="flex-1 rounded-full"
                  disabled={
                    busyId === preview._id ||
                    preview.approvalStatus === "approved"
                  }
                  onClick={() => {
                    setApproval(preview, "approved");
                    setPreview(null);
                  }}
                >
                  <Check className="size-4" />
                  Approve listing
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full text-destructive"
                  disabled={
                    busyId === preview._id ||
                    preview.approvalStatus === "rejected"
                  }
                  onClick={() => {
                    setRejectTarget(preview);
                    setReason("");
                    setPreview(null);
                  }}
                >
                  <X className="size-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this listing?</DialogTitle>
            <DialogDescription>
              <strong>{rejectTarget?.title}</strong> will be hidden from the
              public site. The technician sees it as rejected and can edit it to
              resubmit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-xs font-semibold">
              Reason (optional)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Price looks unrealistic, or the description needs more detail."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setRejectTarget(null)}
            >
              Keep pending
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={rejecting}
              onClick={handleReject}
            >
              {rejecting ? <Loader2 className="size-4 animate-spin" /> : null}
              Reject listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminServicesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      }
    >
      <AdminServicesInner />
    </React.Suspense>
  );
}