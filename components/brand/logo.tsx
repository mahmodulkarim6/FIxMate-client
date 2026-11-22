import Link from "next/link";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  className?: string;
  compact?: boolean;
  inverted?: boolean;
};

export function Logo({
  href = "/",
  className,
  compact = false,
  inverted = false,
}: LogoProps) {
  const content = (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid size-9 place-items-center rounded-xl shadow-[0_6px_16px_-8px_rgba(16,58,54,0.9)] transition-transform duration-300 group-hover:-rotate-6",
          inverted ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
        )}
      >
        <Wrench className="size-4.5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span
          className={cn(
            "font-heading text-[1.35rem] leading-none font-extrabold tracking-tight",
            inverted ? "text-white" : "text-foreground"
          )}
        >
          Fix<span className="text-accent-foreground dark:text-accent">Mate</span>
          <span className="text-accent-foreground dark:text-accent"></span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="FixMate home" className="inline-flex">
      {content}
    </Link>
  );
}