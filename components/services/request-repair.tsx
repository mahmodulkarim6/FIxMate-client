"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Lock,
  Send,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { apiRequest } from "@/lib/client-api";
import { todayInputValue } from "@/lib/format";
import type { Role, Service } from "@/lib/types";

export function RequestRepair({
  service,
}: {
  service: Pick<Service, "_id" | "title" | "technicianEmail">;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const role = ((user as { role?: Role } | undefined)?.role ?? "customer") as Role;

  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [created, setCreated] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [form, setForm] = React.useState({
    phone: "",
    address: "",
    preferredDate: "",
    problemDescription: "",
  });

  React.useEffect(() => {
    if (!user) return;
    const profile = user as { phone?: string | null; area?: string | null };
    setForm((current) => ({
      ...current,
      phone: current.phone || profile.phone || "",
      address: current.address || profile.area || "",
    }));
  }, [user]);

  if (isPending) {
    return (
      <Button size="lg" disabled className="h-12 w-full rounded-xl">
        <Loader2 className="size-4 animate-spin" />
        Checking your account…
      </Button>
    );
  }

  if (!user) {
    return (
      <div className="space-y-2">
        <Button
          size="lg"
          className="h-12 w-full rounded-xl"
          render={
            <Link href={`/sign-in?redirect=${encodeURIComponent(pathname)}`} />
          }
        >
          <Lock className="size-4" />
          Sign in to request this repair
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          New here?{" "}
          <Link href="/sign-up" className="font-semibold text-primary hover:underline">
            Create a customer account
          </Link>
        </p>
      </div>
    );
  }

  if (role !== "customer") {
    const isOwner = user.email === service.technicianEmail;
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
        <p className="text-sm font-semibold">
          {isOwner ? "This is your own listing" : "Only customers can request a repair"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {isOwner
            ? "You cannot book a service you created. Use your dashboard to manage incoming jobs."
            : "Technician and admin accounts cannot send repair requests. Switch to a customer account to book a service."}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 rounded-full"
          render={
            <Link
              href={
                role === "technician"
                  ? "/dashboard/technician/requests"
                  : "/dashboard/admin/bookings"
              }
            />
          }
        >
          Go to dashboard
        </Button>
      </div>
    );
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!/^[+\d][\d\s-]{7,}$/.test(form.phone.trim())) {
      next.phone = "Enter a valid phone number (at least 8 digits).";
    }
    if (form.address.trim().length < 8) {
      next.address = "Add a service address with at least 8 characters.";
    }
    if (!form.preferredDate) {
      next.preferredDate = "Choose a preferred date.";
    } else if (form.preferredDate < todayInputValue()) {
      next.preferredDate = "The date cannot be in the past.";
    }
    if (form.problemDescription.trim().length < 20) {
      next.problemDescription =
        "Describe the problem in at least 20 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await apiRequest("/api/bookings", {
        method: "POST",
        body: { serviceId: service._id, ...form },
      });
      setCreated(true);
      toast.success("Repair request sent — the technician will respond shortly.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not send the request.";
      toast.error(message);
      if (message.toLowerCase().includes("active request")) {
        setErrors({ form: message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setCreated(false);
          setErrors({});
        }
      }}
    >
      <DialogTrigger
        render={<Button size="lg" className="h-12 w-full rounded-xl" />}
      >
        <Send className="size-4" />
        Request this repair
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {created ? (
          <div className="py-4 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/12 text-emerald-600">
              <CheckCircle2 className="size-7" />
            </span>
            <DialogTitle className="mt-4 text-center font-heading text-xl font-semibold">
              Request sent successfully
            </DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-sm text-center">
              Your request for <strong>{service.title}</strong> is now in the
              technician&apos;s queue. You can follow every status change from My
              Bookings.
            </DialogDescription>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                className="rounded-full"
                render={<Link href="/dashboard/customer/bookings" />}
              >
                Go to my bookings
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setOpen(false)}
              >
                Keep browsing
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-base font-semibold">
                Request a repair
              </DialogTitle>
              <DialogDescription>
                Send your details to the technician. No payment is taken now —
                you pay only after the job is completed.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Your name</Label>
                  <Input value={user.name} readOnly className="bg-secondary/60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email</Label>
                  <Input value={user.email} readOnly className="bg-secondary/60" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Phone number
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="+880 17XX XXXXXX"
                  aria-invalid={Boolean(errors.phone)}
                  className="h-10"
                />
                {errors.phone && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold">
                  Service address
                </Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  placeholder="House, road, area — e.g. House 12, Road 5, Dhanmondi, Dhaka"
                  rows={2}
                  aria-invalid={Boolean(errors.address)}
                />
                {errors.address && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preferredDate" className="text-xs font-semibold">
                  Preferred date
                </Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="preferredDate"
                    type="date"
                    min={todayInputValue()}
                    value={form.preferredDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        preferredDate: event.target.value,
                      }))
                    }
                    aria-invalid={Boolean(errors.preferredDate)}
                    className="h-10 pl-9"
                  />
                </div>
                {errors.preferredDate && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.preferredDate}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="problem" className="text-xs font-semibold">
                  What is wrong with the device?
                </Label>
                <Textarea
                  id="problem"
                  value={form.problemDescription}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      problemDescription: event.target.value,
                    }))
                  }
                  placeholder="Minimum 20 characters — symptoms, how long it has been happening, anything the technician should know."
                  rows={4}
                  aria-invalid={Boolean(errors.problemDescription)}
                />
                <div className="flex items-center justify-between text-[11px]">
                  {errors.problemDescription ? (
                    <p className="font-medium text-destructive">
                      {errors.problemDescription}
                    </p>
                  ) : (
                    <span className="text-muted-foreground">
                      The more detail, the better the diagnosis.
                    </span>
                  )}
                  <span
                    className={
                      form.problemDescription.trim().length >= 20
                        ? "font-medium text-emerald-600"
                        : "text-muted-foreground"
                    }
                  >
                    {form.problemDescription.trim().length}/20
                  </span>
                </div>
              </div>

              {errors.form && (
                <div className="rounded-xl border border-destructive/25 bg-destructive/8 px-3 py-2 text-[11px] font-medium text-destructive">
                  {errors.form}
                </div>
              )}

              <div className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2.5 text-[11px] text-muted-foreground">
                <UserRound className="size-3.5 shrink-0 text-primary" />
                Requesting as {user.name} · {user.email}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending request…
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Send repair request
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
