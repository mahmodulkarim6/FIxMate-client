"use client";

import * as React from "react";

import { apiRequest } from "@/lib/client-api";

export function useApi<T>(path: string | null) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nonce, setNonce] = React.useState(0);
  const requestId = React.useRef(0);

  const refresh = React.useCallback(() => {
    setNonce((value) => value + 1);
  }, []);

  React.useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    const current = ++requestId.current;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    apiRequest<T>(path, { signal: controller.signal })
      .then((payload) => {
        if (current !== requestId.current) return;
        setData(payload);
      })
      .catch((cause: unknown) => {
        if (current !== requestId.current) return;
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Something went wrong");
      })
      .finally(() => {
        if (current !== requestId.current) return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [path, nonce]);

  return { data, setData, loading, error, refresh };
}
