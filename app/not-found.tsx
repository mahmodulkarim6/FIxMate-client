import Link from "next/link";
import { ArrowLeft, Compass, Wrench } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(65%_60%_at_50%_0%,color-mix(in_oklch,var(--accent)_16%,transparent),transparent_70%)]" />
        <div className="grid-lines absolute inset-0 opacity-30 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]" />
      </div>

      <header className="shell flex h-16 items-center">
        <Logo />
      </header>

      <main className="shell flex flex-1 flex-col items-center justify-center py-16 text-center">
        <span className="relative grid size-20 place-items-center rounded-3xl bg-card shadow-[0_20px_50px_-30px_rgba(16,58,54,0.6)] ring-1 ring-border">
          <Wrench className="size-8 text-primary" />
          <span className="absolute -top-2 -right-2 grid size-8 place-items-center rounded-full bg-accent text-accent-foreground">
            <Compass className="size-4" />
          </span>
        </span>

        <p className="mt-8 font-heading text-7xl leading-none font-extrabold tracking-tight text-border sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
          This page needs a repair
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          The page you are looking for was moved, deleted, or never existed. Your
          devices are safe — try the services page or head back home.
        </p>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Button className="rounded-full" render={<Link href="/" />}>
            <ArrowLeft className="size-4" />
            Back to home
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            render={<Link href="/services" />}
          >
            Browse services
          </Button>
        </div>

        <p className="mt-8 text-[11px] text-muted-foreground">
          Need a hand?{" "}
          <Link href="/about" className="font-semibold text-primary hover:underline">
            See how FixMate works
          </Link>
        </p>
      </main>
    </div>
  );
}
