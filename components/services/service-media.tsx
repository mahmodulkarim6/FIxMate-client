import Image from "next/image";

import { ServiceArt, hasRealImage } from "@/components/services/service-art";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ServiceMedia({
  service,
  sizes,
  priority = false,
  className,
  showLabel = false,
}: {
  service: Pick<Service, "image" | "category" | "title">;
  sizes?: string;
  priority?: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  if (!hasRealImage(service.image)) {
    return (
      <ServiceArt
        category={service.category}
        showLabel={showLabel}
        className={cn("absolute inset-0", className)}
      />
    );
  }

  return (
    <Image
      src={service.image}
      alt={service.title}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
