import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center",
        className
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button
          className="mt-6 rounded-full"
          render={<Link href={action.href} />}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
