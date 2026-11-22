"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
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
  SheetClose,
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

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "How it works" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const user = session?.user;
  const role = ((user as { role?: Role } | undefined)?.role ?? "customer") as Role;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  async function handleSignOut() {
    try {
      await signOut();
      clearAuthToken();
      toast.success("Signed out. See you soon!");
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Could not sign you out. Please try again.");
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="shell flex h-16 items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center justify-self-start">
          <Logo />
        </div>

        <nav className="hidden items-center justify-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(link.href) && "text-foreground"
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-accent-foreground dark:bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 justify-self-end">
          <ThemeToggle className="hidden sm:inline-flex" />

          {isPending ? (
            <div className="ml-2 size-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 flex items-center gap-2 rounded-full border border-border/70 bg-card py-1 pr-2 pl-1 transition-colors outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60">
                <Avatar className="size-7">
                  <AvatarImage
                    src={(user as { image?: string | null }).image ?? undefined}
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                    {initialsOf(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-24 truncate text-sm font-medium lg:block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex flex-col gap-2 py-2">
                  <span className="text-sm font-semibold text-foreground">
                    {user.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {ROLE_LABEL[role]}
                    </Badge>
                    <span className="truncate text-[11px] font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(DASHBOARD_HOME[role])}
                >
                  <LayoutDashboard />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <UserRound />
                  Update profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Button variant="ghost" render={<Link href="/sign-in" />}>
                Sign in
              </Button>
              <Button
                className="rounded-full px-4"
                render={<Link href="/sign-up" />}
              >
                Sign up
              </Button>
            </div>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] max-w-sm p-0">
              <SheetHeader className="border-b border-border/70 p-5">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        className={cn(
                          "rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                          isActive(link.href) && "bg-secondary text-foreground"
                        )}
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}

                <div className="my-3 h-px bg-border" />

                {user ? (
                  <>
                    <div className="mb-2 flex items-center gap-3 rounded-2xl bg-secondary/70 p-3">
                      <Avatar className="size-10">
                        <AvatarImage
                          src={
                            (user as { image?: string | null }).image ??
                            undefined
                          }
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initialsOf(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ROLE_LABEL[role]}
                        </p>
                      </div>
                    </div>
                    <SheetClose
                      render={
                        <Link
                          href={DASHBOARD_HOME[role]}
                          className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-secondary"
                        />
                      }
                    >
                      Dashboard
                    </SheetClose>
                    <SheetClose
                      render={
                        <Link
                          href="/dashboard/profile"
                          className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-secondary"
                        />
                      }
                    >
                      Update profile
                    </SheetClose>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="rounded-xl px-3 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="grid gap-2">
                    <SheetClose
                      render={
                        <Link
                          href="/sign-in"
                          className="rounded-xl border border-border px-3 py-3 text-center text-sm font-medium hover:bg-secondary"
                        />
                      }
                    >
                      Sign in
                    </SheetClose>
                    <SheetClose
                      render={
                        <Link
                          href="/sign-up"
                          className="rounded-xl bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                        />
                      }
                    >
                      Create account
                    </SheetClose>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Theme
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
