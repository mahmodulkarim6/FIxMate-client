import type {
  Service,
  ServiceListResponse,
  ServiceReview,
} from "@/lib/types";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

type ServerFetchOptions = {
  quiet?: boolean;
};

/**
 * Server-side fetch helper used by public Server Components.
 * Returns `null` instead of throwing so a cold API never breaks a page render.
 */
export async function serverApiGet<T>(
  path: string,
  { quiet = false }: ServerFetchOptions = {}
): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      if (!quiet) {
        console.warn(`[fixmate] GET ${path} -> ${response.status}`);
      }
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (!quiet) {
      console.warn(`[fixmate] GET ${path} failed`, error);
    }
    return null;
  }
}

export async function getFeaturedServices(limit = 6): Promise<Service[]> {
  const data = await serverApiGet<{ services: Service[] }>(
    `/api/services?limit=${limit}&sort=newest`,
    { quiet: true }
  );
  return data?.services ?? [];
}

export type ServiceQuery = {
  search?: string;
  category?: string;
  mode?: string;
  sort?: string;
  page?: string | number;
  limit?: number;
};

export function buildServiceQuery(query: ServiceQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category && query.category !== "all") {
    params.set("category", query.category);
  }
  if (query.mode && query.mode !== "all") params.set("mode", query.mode);
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  return params.toString();
}

export async function getServices(
  query: ServiceQuery
): Promise<ServiceListResponse> {
  const qs = buildServiceQuery(query);
  const data = await serverApiGet<ServiceListResponse>(`/api/services?${qs}`, {
    quiet: true,
  });
  return (
    data ?? {
      services: [],
      total: 0,
      page: 1,
      limit: query.limit ?? 9,
      totalPages: 0,
    }
  );
}

export async function getService(id: string): Promise<Service | null> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/services/${id}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("The FixMate API is not reachable right now.");
  }

  // 400 (bad id) and 404 (missing, unapproved or unavailable) → Not Found page.
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) {
    throw new Error(`Could not load this service (${response.status}).`);
  }

  const data = (await response.json()) as { service?: Service };
  return data.service ?? null;
}

export async function getServiceReviews(id: string): Promise<ServiceReview[]> {
  const data = await serverApiGet<{ reviews: ServiceReview[] }>(
    `/api/services/${id}/reviews`,
    { quiet: true }
  );
  return data?.reviews ?? [];
}
