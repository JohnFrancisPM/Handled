"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicEnv, isDemoMode } from "@/lib/env";

/**
 * Browser Supabase client (anon key, RLS-enforced). Used by TanStack Query +
 * Realtime in Stage 4.
 *
 * Returns null in demo mode (env absent) so client components fall back to
 * seeded read-only data instead of crashing the build/runtime.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (isDemoMode()) return null;
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
