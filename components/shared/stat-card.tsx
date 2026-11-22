import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "teal" | "amber" | "green" | "rose" | "violet";
}) {
  const tones = {
    teal: "bg-primary/10 text-primary",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    green: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  };

  return (
    <div className="surface-card relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-3 font-heading text-3xl leading-none font-bold tabular-nums">
            {value}
          </p>
          {hint && (
            <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -bottom-10 size-24 rounded-full opacity-40 blur-2xl",
          tone === "teal" && "bg-primary/20",
          tone === "amber" && "bg-amber-400/30",
          tone === "green" && "bg-emerald-400/25",
          tone === "rose" && "bg-rose-400/25",
          tone === "violet" && "bg-violet-400/25"
        )}
      />
    </div>
  );
}
