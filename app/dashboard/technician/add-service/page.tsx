"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  ImagePlus,
  Info,
  Loader2,
  Plus,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { ServiceMedia } from "@/components/services/service-media";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/lib/client-api";
import { apiRequest } from "@/lib/client-api";
import { useApi } from "@/hooks/use-api";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Category, ServiceMode, TechnicianStats } from "@/lib/types";
import { cn } from "@/lib/utils";

type FormState = {
  title: string;
  category: Category;
  description: string;
  basePrice: string;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  image: string;
  isAvailable: boolean;
};

const INITIAL: FormState = {
  title: "",
  category: "Smartphone",
  description: "",
  basePrice: "",
  estimatedDuration: "",
  serviceMode: "Home Visit",
  serviceArea: "",
  image: "",
  isAvailable: true,
};

export default function AddServicePage() {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(INITIAL);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [createdId, setCreatedId] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const { data: planInfo } = useApi<TechnicianStats>("/api/technician/stats");
  const atLimit =
    planInfo?.plan === "free" &&
    planInfo.serviceLimit !== null &&
    planInfo.totalServices >= planInfo.serviceLimit;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 8) {
      next.title = "Give the service a clear title (at least 8 characters).";
    }
    if (form.description.trim().length < 40) {
      next.description = "Describe the service in at least 40 characters.";
    }
    const price = Number(form.basePrice);
    if (!form.basePrice || Number.isNaN(price) || price <= 0) {
      next.basePrice = "Enter a starting price greater than 0.";
    }
    if (form.estimatedDuration.trim().length < 3) {
      next.estimatedDuration = "Add an estimate, e.g. “2–3 hours”.";
    }
    if (form.serviceArea.trim().length < 3) {
      next.serviceArea = "Add the area you cover, e.g. “Dhanmondi, Dhaka”.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
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
    try {
      const url = await uploadImage(file);
      update("image", url);
      toast.success("Image uploaded to ImgBB.");
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Image upload failed."
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest<{ service: { _id: string } }>(
        "/api/services",
        {
          method: "POST",
          body: {
            title: form.title.trim(),
            category: form.category,
            description: form.description.trim(),
            image: form.image,
            basePrice: Number(form.basePrice),
            estimatedDuration: form.estimatedDuration.trim(),
            serviceMode: form.serviceMode,
            serviceArea: form.serviceArea.trim(),
            isAvailable: form.isAvailable,
          },
        }
      );
      setCreatedId(result.service._id);
      toast.success("Service submitted for admin approval.");
      router.refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not create the service."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (createdId) {
    return (
      <div>
        <PageHeader
          title="Service submitted"
          description="Your listing is queued for admin review."
        />
        <div className="surface-card mx-auto max-w-xl p-8 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-500/12 text-amber-600">
            <CheckCircle2 className="size-8" />
          </span>
          <h2 className="mt-5 font-heading text-2xl font-bold">
            Waiting for approval
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <strong>{form.title}</strong> was saved with a{" "}
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              pending
            </span>{" "}
            status. An admin will review it before it appears on the public
            services page. You can track the status from My services.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              className="rounded-full"
              render={<Link href="/dashboard/technician/my-services" />}
            >
              Go to my services
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setForm(INITIAL);
                setCreatedId(null);
                setErrors({});
              }}
            >
              <Plus className="size-4" />
              Add another service
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const preview = {
    image: form.image,
    category: form.category,
    title: form.title || "Your service title",
  };

  return (
    <div>
      <PageHeader
        title="Add a service"
        description="Publish what you repair. Every listing is reviewed by an admin before it goes live."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
            <Sparkles className="size-3" />
            Approval required
          </span>
        }
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            render={<Link href="/dashboard/technician/my-services" />}
          >
            My services
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        {atLimit && (
          <div className="surface-card flex flex-col gap-3 border-amber-500/30 bg-amber-500/8 p-4 sm:flex-row sm:items-center sm:justify-between xl:col-span-2">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold">Free plan listing limit reached</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  You have used all {planInfo?.serviceLimit} free listings. Upgrade
                  to Pro for unlimited services and the Verified Pro badge.
                </p>
              </div>
            </div>
            <Button
              className="shrink-0 rounded-full"
              render={<Link href="/dashboard/technician/my-services" />}
            >
              Upgrade to Pro
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="surface-card p-5 sm:p-6" noValidate>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">
                Service title
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="e.g. iPhone screen replacement with genuine glass"
                aria-invalid={Boolean(errors.title)}
                className="h-10"
              />
              {errors.title && (
                <p className="text-[11px] font-medium text-destructive">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">
                  Category
                </Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(event) =>
                    update("category", event.target.value as Category)
                  }
                  className="h-10 w-full cursor-pointer rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="serviceMode" className="text-xs font-semibold">
                  Service mode
                </Label>
                <select
                  id="serviceMode"
                  value={form.serviceMode}
                  onChange={(event) =>
                    update("serviceMode", event.target.value as ServiceMode)
                  }
                  className="h-10 w-full cursor-pointer rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
              <Label htmlFor="description" className="text-xs font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="What is included, which brands you handle, and what the customer should expect."
                rows={4}
                aria-invalid={Boolean(errors.description)}
              />
              <div className="flex items-center justify-between text-[11px]">
                {errors.description ? (
                  <p className="font-medium text-destructive">
                    {errors.description}
                  </p>
                ) : (
                  <span className="text-muted-foreground">
                    Be specific — clearer listings get more requests.
                  </span>
                )}
                <span
                  className={cn(
                    form.description.trim().length >= 40
                      ? "font-medium text-emerald-600"
                      : "text-muted-foreground"
                  )}
                >
                  {form.description.trim().length}/40
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="basePrice" className="text-xs font-semibold">
                  Starting price (USD)
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  min={1}
                  step={1}
                  value={form.basePrice}
                  onChange={(event) => update("basePrice", event.target.value)}
                  placeholder="45"
                  aria-invalid={Boolean(errors.basePrice)}
                  className="h-10"
                />
                {errors.basePrice && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.basePrice}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="estimatedDuration"
                  className="text-xs font-semibold"
                >
                  Duration
                </Label>
                <Input
                  id="estimatedDuration"
                  value={form.estimatedDuration}
                  onChange={(event) =>
                    update("estimatedDuration", event.target.value)
                  }
                  placeholder="2–3 hours"
                  aria-invalid={Boolean(errors.estimatedDuration)}
                  className="h-10"
                />
                {errors.estimatedDuration && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.estimatedDuration}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="serviceArea" className="text-xs font-semibold">
                  Service area
                </Label>
                <Input
                  id="serviceArea"
                  value={form.serviceArea}
                  onChange={(event) => update("serviceArea", event.target.value)}
                  placeholder="Dhanmondi, Dhaka"
                  aria-invalid={Boolean(errors.serviceArea)}
                  className="h-10"
                />
                {errors.serviceArea && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.serviceArea}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Cover image (optional)
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                  id="service-image"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-lg"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {uploading ? "Uploading…" : "Upload to ImgBB"}
                </Button>
                {form.image ? (
                  <span className="flex min-w-0 items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-3 py-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    <BadgeCheck className="size-3.5 shrink-0" />
                    <span className="truncate">{form.image}</span>
                    <button
                      type="button"
                      onClick={() => update("image", "")}
                      aria-label="Remove image"
                      className="rounded-full p-0.5 hover:bg-emerald-500/15"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    No image? We render on-brand vector artwork instead.
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-secondary/50 px-4 py-3">
              <div>
                <p className="text-xs font-semibold">Accept new requests</p>
                <p className="text-[11px] text-muted-foreground">
                  Turn off to pause bookings while keeping the listing visible.
                </p>
              </div>
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(checked) => update("isAvailable", checked)}
                aria-label="Accept new requests"
              />
            </div>

            <div className="flex flex-col gap-2 border-t border-border/70 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setForm(INITIAL);
                  setErrors({});
                }}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="rounded-full"
                disabled={submitting || uploading}
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Submit for approval
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border/70 px-4 py-3">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Live preview
              </p>
            </div>
            <div className="p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
                <ServiceMedia service={preview} sizes="(min-width: 1280px) 34vw, 80vw" showLabel />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold shadow-sm">
                  <CategoryIcon category={form.category} className="size-3.5" />
                  {form.category}
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-primary/95 px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                  {form.basePrice ? formatCurrency(Number(form.basePrice)) : "$0"}
                </span>
              </div>

              <h3 className="mt-4 font-heading text-base leading-snug font-semibold">
                {form.title || "Your service title"}
              </h3>
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {form.description ||
                  "Your description helps customers decide whether this is the right fix."}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full bg-secondary px-2.5 py-1">
                  {form.serviceMode}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1">
                  {form.estimatedDuration || "Duration"}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1">
                  {form.serviceArea || "Service area"}
                </span>
              </div>
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <Info className="size-4" />
              </span>
              <h3 className="font-heading text-sm font-semibold">
                How approval works
              </h3>
            </div>
            <ol className="mt-4 space-y-3 text-xs text-muted-foreground">
              {[
                "You submit the listing — it is saved as pending.",
                "An admin reviews the title, price and description.",
                "Approved listings appear on /services immediately.",
                "Rejected listings stay in your dashboard with the reason shown.",
              ].map((step, index) => (
                <li key={step} className="flex gap-2.5">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold">
              <ImagePlus className="size-3.5 text-primary" />
              Image tips
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Landscape images around 1200×900 look best. Uploads go to ImgBB
              through the API, so your key never reaches the browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
