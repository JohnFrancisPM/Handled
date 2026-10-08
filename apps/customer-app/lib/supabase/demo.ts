import "server-only";

import { publicEnv } from "@/lib/env";

/**
 * Read-only seeded demo fallback (ED §5/§15). When auth env is absent the app
 * resolves `NEXT_PUBLIC_DEMO_ORG_SLUG` and serves seeded Acme data so the
 * 3-minute recorded demo cannot hard-fail.
 *
 * Scaffold stub: Stage 4 reads seeded rows (via service-role or public reads
 * scoped to the demo org slug) from docs/customer-app/implementation/seed-data.md.
 */

export function getDemoOrgSlug(): string | null {
  return publicEnv.demoOrgSlug || null;
}

/** Placeholder seeded-read helper. Returns an empty list until Stage 4. */
export async function demoRead<T>(_resource: string): Promise<T[]> {
  return [];
}
