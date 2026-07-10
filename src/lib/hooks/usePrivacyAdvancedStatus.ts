"use client";

import { useCallback, useEffect, useState } from "react";
import type { PrivacyAdvancedStatus } from "@/types/app";

export function usePrivacyAdvancedStatus(pollMs = 30_000) {
  const [status, setStatus] = useState<PrivacyAdvancedStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/privacy-advanced/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        setStatus(null);
      }
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, pollMs);
    return () => clearInterval(interval);
  }, [refetch, pollMs]);

  return { status, loading, refetch };
}

export function formatKeyExpiry(expiresAt: number | null): string {
  if (!expiresAt) return "";
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return "abgelaufen";
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours} Std. ${minutes} Min.`;
  return `${minutes} Min.`;
}
