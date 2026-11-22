import {
  AirVent,
  Laptop,
  Refrigerator,
  Smartphone,
  Tv,
  WashingMachine,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  laptop: Laptop,
  "air-vent": AirVent,
  refrigerator: Refrigerator,
  tv: Tv,
  "washing-machine": WashingMachine,
  zap: Zap,
};

export function CategoryIcon({
  name,
  category,
  className,
}: {
  name?: string;
  category?: Category;
  className?: string;
}) {
  const key =
    name ??
    (category === "Laptop & PC"
      ? "laptop"
      : category === "AC"
        ? "air-vent"
        : category === "Electrical"
          ? "zap"
          : category === "Washing Machine"
            ? "washing-machine"
            : category === "Refrigerator"
              ? "refrigerator"
              : category === "TV"
                ? "tv"
                : category === "Smartphone"
                  ? "smartphone"
                  : "wrench");

  const Icon = ICONS[key] ?? Wrench;
  return <Icon className={className} strokeWidth={1.8} />;
}
