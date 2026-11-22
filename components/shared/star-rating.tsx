import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Read-only 1-5 star display with an optional review count. */
export function StarRating({
  value,
  count,
  className,
  starClassName,
  showValue = true,
}: {
  value: number;
  count?: number;
  className?: string;
  starClassName?: string;
  showValue?: boolean;
}) {
  const rounded = Math.round(Math.max(0, Math.min(5, value)));

  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "size-3",
              star <= rounded
                ? "fill-amber-500 text-amber-500"
                : "fill-transparent text-border",
              starClassName
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-[10px] font-medium text-muted-foreground">
          {value > 0 ? value.toFixed(1) : "New"}
          {typeof count === "number" && count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </span>
  );
}
