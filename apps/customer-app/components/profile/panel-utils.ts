"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/http/client";
import { isDemoMode } from "@/lib/env";
import type { ProfileBundle } from "@/lib/types";
import type { PanelName } from "@/lib/schemas";

/** Shared loader for the full policy bundle (dashboard-api.md GET /api/profile). */
export function useProfileBundle() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<ProfileBundle>("/api/profile")
  });
}

/**
 * Save hook for a policy panel. Writes via PUT /api/profile/[panel]; in demo
 * mode the server no-ops gracefully and we still surface the "Saved" toast so
 * the editor feels live during the recorded demo.
 */
export function usePanelSave(panel: PanelName) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save(data: unknown) {
    setSaving(true);
    setErrorMessage(null);
    try {
      await apiPut(`/api/profile/${panel}`, data);
      // Keep the cached bundle in sync so other panels see the change.
      queryClient.setQueryData<ProfileBundle | undefined>(["profile"], (old) => old);
      setSavedAt(Date.now());
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  }

  return { save, saving, savedAt, errorMessage, isDemo: isDemoMode() };
}
