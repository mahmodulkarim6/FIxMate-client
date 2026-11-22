"use client";

import * as React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Camera,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUser, useSession } from "@/lib/auth-client";
import { uploadImage } from "@/lib/client-api";
import { DASHBOARD_HOME, ROLE_LABEL } from "@/lib/constants";
import { formatDate, initialsOf } from "@/lib/format";
import type { Role } from "@/lib/types";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: Role;
  phone?: string | null;
  area?: string | null;
  bio?: string | null;
  createdAt?: string | Date;
};

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const user = session?.user as SessionUser | undefined;
  const role = user?.role ?? "customer";

  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    area: "",
    bio: "",
  });
  const [hydrated, setHydrated] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [image, setImage] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!user || hydrated) return;
    setForm({
      name: user.name ?? "",
      phone: user.phone ?? "",
      area: user.area ?? "",
      bio: user.bio ?? "",
    });
    setImage(user.image ?? null);
    setHydrated(true);
  }, [user, hydrated]);

  async function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Profile photos must be under 3 MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      const result = await updateUser({ image: url });
      if (result.error) {
        toast.error(result.error.message ?? "Could not save the photo.");
        return;
      }
      setImage(url);
      await refetch();
      toast.success("Profile photo updated.");
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Photo upload failed."
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) {
      next.name = "Your name needs at least 3 characters.";
    }
    if (form.phone && !/^[+\d][\d\s-]{7,}$/.test(form.phone.trim())) {
      next.phone = "Use a valid phone number, e.g. +880 17XX XXXXXX.";
    }
    if (form.bio.length > 400) {
      next.bio = "Keep the bio under 400 characters.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const result = await updateUser({
        name: form.name.trim(),
        phone: form.phone.trim(),
        area: form.area.trim(),
        bio: form.bio.trim(),
      });
      if (result.error) {
        toast.error(result.error.message ?? "Could not save your profile.");
        return;
      }
      await refetch();
      toast.success("Profile updated.");
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (isPending) {
    return (
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="h-72 animate-pulse rounded-3xl border border-border bg-card" />
        <div className="h-96 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="surface-card mx-auto max-w-md p-8 text-center">
        <p className="text-sm font-semibold">You are signed out</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sign in again to update your profile.
        </p>
        <Button className="mt-4 rounded-full" render={<Link href="/sign-in" />}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Update profile"
        description="Keep your contact details current — technicians use your phone and address to reach you, and customers see your name on every listing."
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            render={<Link href={DASHBOARD_HOME[role]} />}
          >
            Back to dashboard
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <div className="surface-card p-6 text-center">
            <div className="relative mx-auto size-24">
              <Avatar className="size-24 ring-4 ring-secondary">
                <AvatarImage src={image ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/10 font-heading text-2xl font-bold text-primary">
                  {initialsOf(user.name)}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile photo"
                className="absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Camera className="size-3.5" />
                )}
              </button>
            </div>

            <h2 className="mt-4 font-heading text-lg font-bold">{user.name}</h2>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {user.email}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              <Badge
                variant="outline"
                className="rounded-full border-primary/25 bg-primary/5 px-2.5 py-0.5 text-[10px] font-semibold text-primary"
              >
                <ShieldCheck className="mr-1 size-3" />
                {ROLE_LABEL[role]}
              </Badge>
              {role === "technician" && (
                <Badge
                  variant="outline"
                  className="rounded-full border-emerald-600/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                >
                  <BadgeCheck className="mr-1 size-3" />
                  Verified tech
                </Badge>
              )}
            </div>

            <p className="mt-4 text-[11px] text-muted-foreground">
              {uploading
                ? "Uploading photo to ImgBB…"
                : "Tap the camera to upload a new photo (max 3 MB)."}
            </p>
          </div>

          <div className="surface-card p-5">
            <h3 className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Account details
            </h3>
            <ul className="mt-4 space-y-3 text-xs">
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="size-3.5" /> Email
                </span>
                <span className="truncate font-medium">{user.email}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <UserRound className="size-3.5" /> Role
                </span>
                <span className="font-medium">{ROLE_LABEL[role]}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ShieldCheck className="size-3.5" /> Member since
                </span>
                <span className="font-medium">
                  {user.createdAt ? formatDate(user.createdAt) : "—"}
                </span>
              </li>
            </ul>
            <p className="mt-4 rounded-xl bg-secondary/70 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
              Email and role are managed by FixMate. Ask an admin if either needs
              to change.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="surface-card p-5 sm:p-6" noValidate>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <UserRound className="size-4" />
            </span>
            <div>
              <h2 className="font-heading text-sm font-semibold">
                Personal information
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Used on bookings and service listings.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Full name
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                aria-invalid={Boolean(errors.name)}
                className="h-10"
              />
              {errors.name && (
                <p className="text-[11px] font-medium text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Phone number
                </Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="+880 17XX XXXXXX"
                    aria-invalid={Boolean(errors.phone)}
                    className="h-10 pl-9"
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="area" className="text-xs font-semibold">
                  Area / city
                </Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="area"
                    value={form.area}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        area: event.target.value,
                      }))
                    }
                    placeholder="Dhanmondi, Dhaka"
                    className="h-10 pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-semibold">
                {role === "technician" ? "Short bio" : "About you"}
              </Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(event) =>
                  setForm((current) => ({ ...current, bio: event.target.value }))
                }
                placeholder={
                  role === "technician"
                    ? "e.g. 8 years repairing smartphones and laptops. Certified in board-level diagnostics."
                    : "e.g. I work from home, so weekday mornings are best for visits."
                }
                rows={4}
                aria-invalid={Boolean(errors.bio)}
              />
              <div className="flex items-center justify-between text-[11px]">
                {errors.bio ? (
                  <p className="font-medium text-destructive">{errors.bio}</p>
                ) : (
                  <span className="text-muted-foreground">
                    {role === "technician"
                      ? "This appears on your public service listings."
                      : "Only shared with technicians you book."}
                  </span>
                )}
                <span
                  className={
                    form.bio.length > 400
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {form.bio.length}/400
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-secondary/50 px-3 py-2.5 text-[11px] text-muted-foreground">
              <Mail className="size-3.5 shrink-0 text-primary" />
              Email stays <strong className="text-foreground">{user.email}</strong>{" "}
              — contact an admin to change it.
            </div>

            <div className="flex flex-col gap-2 border-t border-border/70 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setForm({
                    name: user.name ?? "",
                    phone: user.phone ?? "",
                    area: user.area ?? "",
                    bio: user.bio ?? "",
                  });
                  setErrors({});
                }}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="rounded-full"
                disabled={saving || uploading}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
