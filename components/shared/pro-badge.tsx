import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/** The Verified Pro badge shown on listings owned by Pro technicians. */
export function ProBadge({
  className,
  label = "Verified Pro",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/12 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200",
        className
      )}
    >
      <BadgeCheck className="size-3" />
      {label}
    </span>
  );
}
