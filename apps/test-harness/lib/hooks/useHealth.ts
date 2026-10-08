"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResult, HealthData } from "@/lib/types";

/** Config-presence booleans for the offline banner / mock badge (never exposes secrets). */
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    staleTime: Infinity,
    queryFn: async (): Promise<HealthData> => {
      const res = await fetch("/api/health");
      const env = (await res.json()) as ApiResult<HealthData>;
      if (!env.ok) throw new Error(env.error.message);
      return env.data;
    }
  });
}
