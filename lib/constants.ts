import type { Category, Role, ServiceMode } from "@/lib/types";

export const CATEGORIES: {
  name: Category;
  blurb: string;
  icon: string;
}[] = [
  {
    name: "Smartphone",
    blurb: "Screens, batteries & boards",
    icon: "smartphone",
  },
  { name: "Laptop & PC", blurb: "Speed, repairs & upgrades", icon: "laptop" },
  { name: "AC", blurb: "Servicing, gas & installation", icon: "air-vent" },
  {
    name: "Refrigerator",
    blurb: "Cooling, compressor & leaks",
    icon: "refrigerator",
  },
  { name: "TV", blurb: "Panels, sound & smart fixes", icon: "tv" },
  {
    name: "Washing Machine",
    blurb: "Drainage, drum & motors",
    icon: "washing-machine",
  },
  { name: "Electrical", blurb: "Wiring, sockets & safety", icon: "zap" },
];

export const SERVICE_MODES: ServiceMode[] = ["Home Visit", "Shop Drop-off"];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

export const ROLE_LABEL: Record<Role, string> = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
};

export const DASHBOARD_HOME: Record<Role, string> = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
};

export const BRAND = {
  name: "FixMate",
  tagline: "Repairs, minus the guesswork.",
  email: "hello@fixmate.dev",
  phone: "+880 1700 000 000",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  currency: "USD",
};

export const SEARCH_DEBOUNCE_MS = 350;
