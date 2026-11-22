"use client";

import { API_URL } from "@/lib/api";

let cachedToken: { token: string; expiresAt: number } | null = null;

function readExpiry(token: string) {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return 0;
    const payload = JSON.parse(atob(base64)) as { exp?: number };
    return payload.exp ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/** Fetches the BetterAuth-issued JWT and caches it until shortly before expiry. */
export async function getAuthToken(force = false): Promise<string | null> {
  if (
    !force &&
    cachedToken &&
    cachedToken.expiresAt - 30_000 > Date.now()
  ) {
    return cachedToken.token;
  }

  try {
    const response = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { token?: string };
    if (!data.token) return null;
    cachedToken = {
      token: data.token,
      expiresAt: readExpiry(data.token) || Date.now() + 5 * 60_000,
    };
    return data.token;
  } catch {
    return null;
  }
}

export function clearAuthToken() {
  cachedToken = null;
}

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    credentials: "omit",
    signal,
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok) {
    if (response.status === 401) clearAuthToken();
    throw new ApiRequestError(
      payload?.message ?? `Request failed (${response.status})`,
      response.status
    );
  }

  return payload as T;
}

/**
 * Downloads a PDF invoice (for a paid booking) through the authenticated API.
 * A plain <a href> cannot send the bearer token, so we fetch a blob instead.
 */
export async function downloadInvoice({
  paymentId,
  bookingId,
}: {
  paymentId?: string;
  bookingId?: string;
}): Promise<void> {
  const path = paymentId
    ? `/api/payments/${paymentId}/invoice`
    : bookingId
      ? `/api/payments/booking/${bookingId}/invoice`
      : null;

  if (!path) {
    throw new ApiRequestError("Choose a paid job to download its invoice.", 400);
  }

  const token = await getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new ApiRequestError(
      payload?.message ?? `Invoice download failed (${response.status}).`,
      response.status
    );
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const matched = /filename="?([^";]+)"?/i.exec(disposition);
  const fileName = matched?.[1] ?? "fixmate-invoice.pdf";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function uploadImage(file: File): Promise<string> {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/api/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { url?: string; message?: string }
    | null;

  if (!response.ok || !payload?.url) {
    throw new ApiRequestError(
      payload?.message ?? "Image upload failed. Please try again.",
      response.status
    );
  }

  return payload.url;
}
