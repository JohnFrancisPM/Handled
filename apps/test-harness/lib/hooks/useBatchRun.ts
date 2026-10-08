"use client";

import { useMutation } from "@tanstack/react-query";
import type { ApiResult, BatchRunData } from "@/lib/types";

/** Fire the one-button batch. Returns the full envelope; the panel renders summary + grid. */
export function useBatchRun() {
  return useMutation({
    mutationFn: async (): Promise<ApiResult<BatchRunData>> => {
      const res = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      return (await res.json()) as ApiResult<BatchRunData>;
    }
  });
}
