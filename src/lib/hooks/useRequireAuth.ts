"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe, type MeUser } from "./useMe";

export function useRequireAuth(): {
  user: MeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
} {
  const router = useRouter();
  const { user, isLoading, isError, refetch } = useMe();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace("/auth/login");
    }
  }, [isLoading, isError, user, router]);

  return {
    user,
    isLoading,
    isAuthenticated: !isLoading && !isError && !!user,
    refetch,
  };
}
