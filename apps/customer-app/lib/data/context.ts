import "server-only";

import { isDemoMode } from "@/lib/env";
import { getSessionOrg } from "@/lib/supabase/server";

/**
 * Data context: how a request should be served.
 * - `demo`   → read seeded Acme fixtures, read-only (no env / recorded demo).
 * - `live`   → authenticated; query Supabase scoped to `orgId`.
 * - `null`   → live but no session → caller returns 401.
 */
export type DataContext = { mode: "demo" } | { mode: "live"; orgId: string };

export async function getContext(): Promise<DataContext | null> {
  if (isDemoMode()) return { mode: "demo" };
  const session = await getSessionOrg();
  if (!session) return null;
  return { mode: "live", orgId: session.orgId };
}

/** True when writes should be a graceful no-op (demo mode, read-only). */
export function isReadOnly(ctx: DataContext): boolean {
  return ctx.mode === "demo";
}
