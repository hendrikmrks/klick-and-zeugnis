"use client";

import { useCallback, useEffect, useState } from "react";

export type MeUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  subscriptionLevel: "Free" | "Pro" | "Premium" | "Vip";
  subscriptionExpiresAt?: string;
  email?: string;
  emailVerified?: string;
  image?: string;
  totpEnabled?: boolean;
  privacyAdvancedModeEnabled?: boolean;
  role?: string;
  createdAt: string;
  updatedAt: string;
};

export function useMe() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) {
        throw new Error("Not logged in");
      }
      const data = await res.json();
      setUser(data);
      setIsError(false);
    } catch {
      setUser(null);
      setIsError(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchMe = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          throw new Error("Not logged in");
        }
        const data = await res.json();
        if (mounted) {
          setUser(data);
          setIsError(false);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setIsError(true);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchMe();

    return () => {
      mounted = false;
    };
  }, []);

  return { user, isLoading, isError, refetch };
}
