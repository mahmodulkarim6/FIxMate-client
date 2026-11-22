"use client";

import * as React from "react";
import {
  Loader2,
  MoreHorizontal,
  RotateCcw,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableCard, TableSkeleton } from "@/components/dashboard/table-card";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApi } from "@/hooks/use-api";
import { useSession } from "@/lib/auth-client";
import { apiRequest } from "@/lib/client-api";
import { ROLE_LABEL } from "@/lib/constants";
import { formatDate, initialsOf } from "@/lib/format";
import type { AdminUser, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLE_TONES: Record<Role, string> = {
  customer: "border-blue-600/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  technician:
    "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  admin:
    "border-violet-600/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

const ROLES: Role[] = ["customer", "technician", "admin"];

export default function AdminUsersPage() {
  const { data, loading, error, refresh } = useApi<{ users: AdminUser[] }>(
    "/api/admin/users"
  );
  const { data: session } = useSession();
  const currentEmail = session?.user?.email ?? "";

  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"all" | Role>("all");
  const [target, setTarget] = React.useState<{
    user: AdminUser;
    role: Role;
  } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const users = data?.users ?? [];
  const filtered = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const term = query.trim().toLowerCase();
    const matchesQuery =
      !term ||
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term);
    return matchesRole && matchesQuery;
  });

  const counts = {
    total: users.length,
    customer: users.filter((user) => user.role === "customer").length,
    technician: users.filter((user) => user.role === "technician").length,
    admin: users.filter((user) => user.role === "admin").length,
  };

  async function handleRoleChange() {
    if (!target) return;
    setSaving(true);
    try {
      await apiRequest(`/api/admin/users/${target.user.id}/role`, {
        method: "PATCH",
        body: { role: target.role },
      });
      toast.success(
        `${target.user.name} is now a ${ROLE_LABEL[target.role].toLowerCase()}.`
      );
      setTarget(null);
      refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not change the role."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Manage users"
        description="Every account on FixMate with its role. You cannot change your own role — ask another admin if you need to."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total accounts" value={counts.total} icon={Users} />
        <StatCard
          label="Customers"
          value={counts.customer}
          icon={Users}
          tone="violet"
        />
        <StatCard
          label="Technicians"
          value={counts.technician}
          hint={`${users.filter((user) => user.plan === "pro").length} on Pro`}
          icon={UserCog}
          tone="green"
        />
        <StatCard
          label="Admins"
          value={counts.admin}
          icon={ShieldCheck}
          tone="amber"
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

      <div className="mt-5 mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...ROLES] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                roleFilter === role
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary"
              )}
            >
              {role === "all" ? "All roles" : ROLE_LABEL[role]}
              <span className="ml-1.5 opacity-70">
                {role === "all" ? counts.total : counts[role]}
              </span>
            </button>
          ))}
        </div>

        <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 sm:w-64">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="sr-only">Search users</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or email…"
            className="h-full w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/70"
          />
        </label>
      </div>

      <TableCard>
        {loading ? (
          <TableSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <Users className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold">No users found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different role filter or clear the search.
            </p>
          </div>
        ) : (
          <>
            <table className="hidden w-full min-w-[820px] text-sm md:table">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40 text-left text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  <th className="px-5 py-3">User</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Area</th>
                  <th className="px-3 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.map((user) => {
                  const isSelf = user.email === currentEmail;
                  return (
                    <tr key={user.id} className="hover:bg-secondary/25">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarImage
                              src={user.image ?? undefined}
                              alt={user.name}
                            />
                            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                              {initialsOf(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-sm font-semibold">
                              {user.name}
                              {user.role === "technician" && user.plan === "pro" && (
                                <span className="rounded-full border border-amber-500/35 bg-amber-500/12 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-800 uppercase dark:text-amber-200">
                                  Pro
                                </span>
                              )}
                              {isSelf && (
                                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-muted-foreground uppercase">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            ROLE_TONES[user.role]
                          )}
                        >
                          {ROLE_LABEL[user.role]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {user.phone || "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {user.area || "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {user.createdAt ? formatDate(user.createdAt) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={isSelf}
                            aria-label={`Change role for ${user.name}`}
                            className={cn(
                              "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-secondary",
                              isSelf && "pointer-events-none opacity-40"
                            )}
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>
                              Change role
                              {isSelf && (
                                <span className="mt-1 block text-[10px] font-normal text-muted-foreground">
                                  You cannot change your own role.
                                </span>
                              )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {ROLES.map((role) => (
                              <DropdownMenuItem
                                key={role}
                                disabled={user.role === role}
                                onClick={() => setTarget({ user, role })}
                              >
                                <ShieldCheck />
                                {ROLE_LABEL[role]}
                                {user.role === role && (
                                  <span className="ml-auto text-[10px] text-muted-foreground">
                                    Current
                                  </span>
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="divide-y divide-border/70 md:hidden">
              {filtered.map((user) => {
                const isSelf = user.email === currentEmail;
                return (
                  <div key={user.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage
                          src={user.image ?? undefined}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                          {initialsOf(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {user.name}
                          {user.role === "technician" && user.plan === "pro" && (
                            <span className="ml-1.5 rounded-full border border-amber-500/35 bg-amber-500/12 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-800 uppercase dark:text-amber-200">
                              Pro
                            </span>
                          )}
                          {isSelf && (
                            <span className="ml-1.5 text-[10px] text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          ROLE_TONES[user.role]
                        )}
                      >
                        {ROLE_LABEL[user.role]}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {ROLES.map((role) => (
                        <Button
                          key={role}
                          variant={user.role === role ? "default" : "outline"}
                          size="sm"
                          className="rounded-lg text-[11px]"
                          disabled={isSelf || user.role === role}
                          onClick={() => setTarget({ user, role })}
                        >
                          {ROLE_LABEL[role]}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </TableCard>

      <Dialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change this user&apos;s role?</DialogTitle>
            <DialogDescription>
              <strong>{target?.user.name}</strong> ({target?.user.email}) will
              become a{" "}
              <strong>{target ? ROLE_LABEL[target.role].toLowerCase() : ""}</strong>
              . This changes which dashboard and permissions they get
              immediately.
            </DialogDescription>
          </DialogHeader>
          {target?.role === "admin" && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-300">
              Admin accounts can approve listings, change roles and see all
              revenue. Only promote people you trust.
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full"
              disabled={saving}
              onClick={handleRoleChange}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Confirm change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
