import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: { href: string; label: string };
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className
      )}
    >
      <div
        className={cn(
          "max-w-2xl space-y-3",
          align === "center" && "mx-auto space-y-4"
        )}
      >
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="section-title">{title}</h2>
        {description && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary/30 hover:bg-secondary"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
