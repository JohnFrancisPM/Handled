/**
 * Typed environment access + demo-mode detection.
 *
 * Demo mode (ED §5/§15, auth-and-middleware.md): when the Supabase auth env is
 * absent the app loads seeded Acme data read-only so the recorded demo cannot
 * hard-fail. All env reads go through here so Stage-4 code never touches
 * `process.env` directly.
 */

// Public (browser-safe) env.
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  demoOrgSlug: process.env.NEXT_PUBLIC_DEMO_ORG_SLUG ?? ""
} as const;

// Server-only env. NEVER import these values into a Client Component.
export const serverEnv = {
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL ?? "",
  n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET ?? ""
} as const;

/** True when Supabase browser auth env is absent — run read-only against seeded demo data. */
export function isDemoMode(): boolean {
  return !publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey;
}

/** True when the server has a service-role key available for privileged writes. */
export function hasServiceRole(): boolean {
  return Boolean(serverEnv.supabaseUrl && serverEnv.serviceRoleKey);
}
