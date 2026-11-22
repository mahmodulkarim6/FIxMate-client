"use client";

import * as React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  FilePlus2,
  Loader2,
  Pencil,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableCard, TableSkeleton } from "@/components/dashboard/table-card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/hooks/use-api";
import { apiRequest, uploadImage } from "@/lib/client-api";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Category, Service, ServiceMode } from "@/lib/types";
import { cn } from "@/lib/utils";

type EditState = {
  title: string;
  category: Category;
  description: string;
  basePrice: string;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  image: string;
};

function toEditState(service: Service): EditState {
  return {
    title: service.title,
    category: service.category,
    description: service.description,
    basePrice: String(service.basePrice),
    estimatedDuration: service.estimatedDuration,
    serviceMode: service.serviceMode,
    serviceArea: service.serviceArea,
    image: service.image ?? "",
  };
}

export default function MyServicesPage() {
  const { data, loading, error, refresh } = useApi<{
    services: Service[];
    plan: "free" | "pro";
    planSince: string | null;
    serviceLimit: number | null;
  }>("/api/technician/services");
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "approved" | "pending" | "rejected"
  >("all");
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [form, setForm] = React.useState<EditState | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Service | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [upgrading, setUpgrading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const services = data?.services ?? [];
  const plan = data?.plan ?? "free";
  const limit = data?.serviceLimit ?? 3;
  const atLimit = plan === "free" && services.length >= limit;
  const filtered = services.filter((service) => {
    const matchesStatus =
      statusFilter === "all" || service.approvalStatus === statusFilter;
    const term = query.trim().toLowerCase();
    const matchesQuery =
      !term ||
      service.title.toLowerCase().includes(term) ||
      service.category.toLowerCase().includes(term);
    return matchesStatus && matchesQuery;
  });

  function openEdit(service: Service) {
    setEditing(service);
    setForm(toEditState(service));
  }

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Keep the image under 5 MB.");
      return;
    }

    setUploading(true);
    uploadImage(file)
      .then((url) => {
        setForm((current) => (current ? { ...current, image: url } : current));
        toast.success("Image uploaded.");
      })
      .catch((cause) => {
        toast.error(
          cause instanceof Error ? cause.message : "Image upload failed."
        );
      })
      .finally(() => {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      });
  }

  async function handleSave() {
    if (!editing || !form) return;
    if (form.title.trim().length < 8 || form.description.trim().length < 40) {
      toast.error("Title needs 8+ characters and the description 40+.");
      return;
    }
    const price = Number(form.basePrice);
    if (!price || price <= 0) {
      toast.error("Enter a valid starting price.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest(`/api/services/${editing._id}`, {
        method: "PATCH",
        body: {
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          image: form.image,
          basePrice: price,
          estimatedDuration: form.estimatedDuration.trim(),
          serviceMode: form.serviceMode,
          serviceArea: form.serviceArea.trim(),
        },
      });
      toast.success("Changes saved — the listing is pending review again.");
      setEditing(null);
      setForm(null);
      refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not update the service."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(service: Service, checked: boolean) {
    setBusyId(service._id);
    try {
      await apiRequest(`/api/services/${service._id}`, {
        method: "PATCH",
        body: { isAvailable: checked, availabilityOnly: true },
      });
      toast.success(
        checked ? "Service is accepting requests." : "Service paused."
      );
      refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not update availability."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/services/${deleteTarget._id}`, { method: "DELETE" });
      toast.success("Service deleted.");
      setDeleteTarget(null);
      refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not delete the service."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const result = await apiRequest<{ url: string }>(
        "/api/payments/pro-checkout",
        { method: "POST" }
      );
      if (result.url) {
        window.location.assign(result.url);
        return;
      }
      toast.error("Stripe did not return a checkout link.");
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not start the upgrade."
      );
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="My services"
        description="Everything you have listed. Editing content sends the listing back to admin review; pausing availability does not."
        actions={
          atLimit ? (
            <Button
              className="rounded-full"
              disabled={upgrading}
              onClick={handleUpgrade}
            >
              {upgrading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Upgrade to add more
            </Button>
          ) : (
            <Button
              className="rounded-full"
              render={<Link href="/dashboard/technician/add-service" />}
            >
              <FilePlus2 className="size-4" />
              Add a service
            </Button>
          )
        }
      />

      <div
        className={cn(
          "mb-4 flex flex-col gap-3 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
          plan === "pro"
            ? "border-amber-500/30 bg-amber-500/8"
            : "border-border bg-card"
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl",
              plan === "pro"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {plan === "pro" ? (
              <BadgeCheck className="size-4.5" />
            ) : (
              <Wrench className="size-4.5" />
            )}
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {plan === "pro" ? "Pro technician plan" : "Free technician plan"}
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-muted-foreground">
                {plan}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {plan === "pro"
                ? "Unlimited listings plus the Verified Pro badge on every service card."
                : `${services.length} of ${limit} free listings used — Pro removes the cap.`}
            </p>
            {plan === "free" && (
              <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(100, (services.length / limit) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {plan === "free" && (
          <Button
            variant={atLimit ? "default" : "outline"}
            className="shrink-0 rounded-full"
            disabled={upgrading}
            onClick={handleUpgrade}
          >
            {upgrading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Go Pro · $19
          </Button>
        )}
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

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { value: "all", label: "All" },
              { value: "approved", label: "Approved" },
              { value: "pending", label: "Pending" },
              { value: "rejected", label: "Rejected" },
            ] as const
          ).map((option) => {
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
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === option.value
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
          <span className="sr-only">Search your services</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title or category…"
            className="h-full w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/70"
          />
        </label>
      </div>

      <TableCard>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <Wrench className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold">
              {services.length === 0 ? "No services listed yet" : "No matches"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {services.length === 0
                ? "Create your first listing — an admin will approve it before it goes public."
                : "Try another status filter or clear the search."}
            </p>
            {services.length === 0 && (
              <Button
                size="sm"
                className="mt-4 rounded-full"
                render={<Link href="/dashboard/technician/add-service" />}
              >
                <FilePlus2 className="size-3.5" />
                Add your first service
              </Button>
            )}
          </div>
        ) : (
          <>
            <table className="hidden w-full min-w-[940px] text-sm md:table">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40 text-left text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  <th className="px-5 py-3">Service</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Approval</th>
                  <th className="px-3 py-3">Availability</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.map((service) => (
                  <tr key={service._id} className="hover:bg-secondary/25">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                          <ServiceMedia service={service} sizes="40px" />
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate text-sm font-semibold">
                            {service.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {service.serviceMode} · {service.serviceArea}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {service.category}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold">
                      {formatCurrency(service.basePrice)}
                    </td>
                    <td className="px-3 py-3">
                      <ApprovalStatusBadge status={service.approvalStatus} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={service.isAvailable}
                          disabled={busyId === service._id}
                          onCheckedChange={(checked) =>
                            toggleAvailability(service, checked)
                          }
                          aria-label={`Availability for ${service.title}`}
                        />
                        <span className="text-[11px] text-muted-foreground">
                          {service.isAvailable ? "Open" : "Paused"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {formatDate(service.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-full"
                          aria-label="Edit service"
                          onClick={() => openEdit(service)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-full text-destructive hover:bg-destructive/10"
                          aria-label="Delete service"
                          onClick={() => setDeleteTarget(service)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-border/70 md:hidden">
              {filtered.map((service) => (
                <div key={service._id} className="p-4">
                  <div className="flex gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-secondary">
                      <ServiceMedia service={service} sizes="48px" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{service.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {service.category} · {formatCurrency(service.basePrice)}
                      </p>
                    </div>
                    <ApprovalStatusBadge status={service.approvalStatus} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-secondary/60 px-3 py-2">
                    <span className="text-[11px] font-medium">
                      {service.isAvailable ? "Accepting requests" : "Paused"}
                    </span>
                    <Switch
                      checked={service.isAvailable}
                      disabled={busyId === service._id}
                      onCheckedChange={(checked) =>
                        toggleAvailability(service, checked)
                      }
                      aria-label={`Availability for ${service.title}`}
                    />
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg"
                      onClick={() => openEdit(service)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg text-destructive"
                      onClick={() => setDeleteTarget(service)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </TableCard>

      <Dialog
        open={Boolean(editing && form)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setForm(null);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit service</DialogTitle>
            <DialogDescription>
              Saving content changes sets the listing back to{" "}
              <strong>pending</strong> until an admin approves it again.
            </DialogDescription>
          </DialogHeader>

          {form && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Title</Label>
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className="h-10"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Category</Label>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value as Category,
                      })
                    }
                    className="h-10 w-full cursor-pointer rounded-lg border border-input bg-background px-3 text-sm outline-none"
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Service mode</Label>
                  <select
                    value={form.serviceMode}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        serviceMode: event.target.value as ServiceMode,
                      })
                    }
                    className="h-10 w-full cursor-pointer rounded-lg border border-input bg-background px-3 text-sm outline-none"
                  >
                    {SERVICE_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Price (USD)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.basePrice}
                    onChange={(event) =>
                      setForm({ ...form, basePrice: event.target.value })
                    }
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Duration</Label>
                  <Input
                    value={form.estimatedDuration}
                    onChange={(event) =>
                      setForm({ ...form, estimatedDuration: event.target.value })
                    }
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Service area</Label>
                  <Input
                    value={form.serviceArea}
                    onChange={(event) =>
                      setForm({ ...form, serviceArea: event.target.value })
                    }
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Cover image</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : null}
                    {uploading ? "Uploading…" : "Replace image"}
                  </Button>
                  {form.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-destructive"
                      onClick={() => setForm({ ...form, image: "" })}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  )}
                  <span className="truncate text-[10px] text-muted-foreground sm:max-w-[220px]">
                    {form.image || "Vector artwork will be used instead."}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setEditing(null);
                setForm(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full"
              disabled={saving || uploading}
              onClick={handleSave}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this service?</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.title}</strong> will be removed from the
              public site. Existing bookings keep their copied details, so
              history stays intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setDeleteTarget(null)}
            >
              Keep it
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
