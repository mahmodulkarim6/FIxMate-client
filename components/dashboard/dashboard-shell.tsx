"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck,
  CreditCard,
  FilePlus2,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut, useSession } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/client-api";
import { DASHBOARD_HOME, ROLE_LABEL } from "@/lib/constants";
import { initialsOf } from "@/lib/format";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: Record<Role, { group: string; items: NavItem[] }[]> = {
  customer: [
    {
      group: "Customer",
      items: [
        {
          href: "/dashboard/customer",
          label: "Overview",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/customer/bookings",
          label: "My bookings",
          icon: CalendarCheck,
        },
        {
          href: "/dashboard/customer/payments",
          label: "Payment history",
          icon: Wallet,
        },
      ],
    },
  ],
  technician: [
    {
      group: "Technician",
      items: [
        {
          href: "/dashboard/technician",
          label: "Overview",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/technician/add-service",
          label: "Add a service",
          icon: FilePlus2,
        },
        {
          href: "/dashboard/technician/my-services",
          label: "My services",
          icon: Wrench,
        },
        {
          href: "/dashboard/technician/requests",
          label: "Manage requests",
          icon: ListChecks,
        },
      ],
    },
  ],
  admin: [
    {
      group: "Admin",
      items: [
        { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/admin/users", label: "Manage users", icon: Users },
        {
          href: "/dashboard/admin/services",
          label: "Service approval",
          icon: ShieldCheck,
        },
        {
          href: "/dashboard/admin/bookings",
          label: "All bookings",
          icon: CalendarCheck,
        },
        {
          href: "/dashboard/admin/transactions",
          label: "Transactions",
          icon: CreditCard,
        },
      ],
    },
  ],
};

export function DashboardShell({
  user: serverUser,
  children,
}: {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role: Role;
  };
  children: React.ReactNode;
}) {
  // The layout passes the user it read on the server. Follow the live session
  // too, so a new name or photo from Update Profile shows up in the sidebar
  // and top bar straight away (no reload or sign-out needed).
  const { data: liveSession } = useSession();
  const user = liveSession?.user
    ? {
        ...serverUser,
        name: liveSession.user.name || serverUser.name,
        image: liveSession.user.image ?? serverUser.image,
      }
    : serverUser;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const groups = NAV[user.role] ?? NAV.customer;

  async function handleSignOut() {
    try {
      await signOut();
      clearAuthToken();
      toast.success("Signed out successfully.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Try again.");
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo />
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.group}>
            <p className="px-3 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {group.group}
            </p>
            <nav className="mt-2 space-y-1">
              {group.items.map((item) => {
                // Overview links are the dashboard roots, so they only match exactly;
                // otherwise they would stay highlighted on every sub-page.
                const isOverview = Object.values(DASHBOARD_HOME).includes(
                  item.href
                );
                const active =
                  item.href === pathname ||
                  (!isOverview && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-4",
                        active
                          ? "text-sidebar-primary-foreground"
                          : "text-muted-foreground group-hover:text-sidebar-foreground"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        <div>
          <p className="px-3 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Account
          </p>
          <nav className="mt-2 space-y-1">
            <Link
              href="/dashboard/profile"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === "/dashboard/profile"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Settings2 className="size-4" />
              Update profile
            </Link>
            <Link
              href="/"
              className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Home className="size-4" />
              Back to home
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-sidebar-accent/70 p-2.5">
          <Avatar className="size-9">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
              {initialsOf(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{user.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-destructive"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-secondary/30">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        {sidebar}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl lg:hidden"
                  aria-label="Open dashboard menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[84%] max-w-xs border-r-sidebar-border bg-sidebar p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Dashboard navigation</SheetTitle>
              </SheetHeader>
              {sidebar}
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABEL[user.role]} dashboard
            </p>
            <p className="truncate font-heading text-sm font-semibold">
              {greeting()}, {user.name.split(" ")[0]}
            </p>
          </div>

          <div className="hidden items-center gap-1.5 sm:flex">
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-primary/5 text-[10px] font-semibold text-primary capitalize"
            >
              {ROLE_LABEL[user.role]}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground"
              render={<Link href="/" aria-label="Back to home" />}
            >
              <Home className="size-4" />
            </Button>
            <ThemeToggle />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-2 pl-1 outline-none hover:bg-secondary">
              <Avatar className="size-7">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                  {initialsOf(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-24 truncate text-xs font-medium sm:block">
                {user.name}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <span className="block text-sm font-semibold">{user.name}</span>
                <span className="block truncate text-[11px] font-normal text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                <Settings2 />
                Update profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/")}>
                <Home />
                Back to home
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
