import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Integration test helpers (testing.md §Integration — "Vitest + real test
 * Supabase, NOT mocks"). These talk to a THROWAWAY test Supabase project.
 *
 * Every integration suite is guarded with `describe.skipIf(!INTEGRATION_ENABLED)`
 * so the suite skips cleanly when the env is absent (there is no live Supabase in
 * the build/CI sandbox). See tests/integration/README.md to run them for real.
 */

export const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL ?? "";
export const TEST_SERVICE_ROLE_KEY = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ?? "";
export const TEST_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY ?? "";

/** True only when a real test Supabase is configured. */
export const INTEGRATION_ENABLED = Boolean(TEST_SUPABASE_URL && TEST_SERVICE_ROLE_KEY);

/** n8n tool-write suites additionally need the webhook (create_appointment/capture_lead run in n8n). */
export const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ?? "";
export const TOOL_WRITES_ENABLED = INTEGRATION_ENABLED && Boolean(N8N_WEBHOOK_URL);

export const SKIP_REASON =
  "Integration tests skipped: set TEST_SUPABASE_URL + TEST_SUPABASE_SERVICE_ROLE_KEY " +
  "(and TEST_SUPABASE_ANON_KEY for RLS) against a throwaway test Supabase. See tests/integration/README.md.";

if (!INTEGRATION_ENABLED) {
  // Printed once per run so a green suite with skips is self-explanatory.
  // eslint-disable-next-line no-console
  console.info(`[integration] ${SKIP_REASON}`);
}

/** Service-role client: bypasses RLS, used for fixture setup/teardown. */
export function serviceClient(): SupabaseClient {
  return createClient(TEST_SUPABASE_URL, TEST_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

/** Fresh anon client (RLS-enforced); sign a user in to scope it to their org. */
export function anonClient(): SupabaseClient {
  return createClient(TEST_SUPABASE_URL, TEST_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export type SeededOrg = {
  orgId: string;
  userEmail: string;
  userPassword: string;
  userId: string;
};

/**
 * Create an organization + an auth user + a dashboard_users row linking them.
 * Returns the ids/credentials needed to sign in as that org's owner.
 */
export async function seedOrg(svc: SupabaseClient, name: string): Promise<SeededOrg> {
  const slug = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data: org, error: orgErr } = await svc
    .from("organizations")
    .insert({ name, slug })
    .select("id")
    .single();
  if (orgErr || !org) throw new Error(`seedOrg: org insert failed: ${orgErr?.message}`);
  const orgId = (org as { id: string }).id;

  const userEmail = `${slug}@example.test`;
  const userPassword = `Test-${Math.random().toString(36).slice(2)}!1`;
  const { data: created, error: userErr } = await svc.auth.admin.createUser({
    email: userEmail,
    password: userPassword,
    email_confirm: true
  });
  if (userErr || !created.user) throw new Error(`seedOrg: user create failed: ${userErr?.message}`);
  const userId = created.user.id;

  const { error: duErr } = await svc
    .from("dashboard_users")
    .insert({ id: userId, org_id: orgId, email: userEmail });
  if (duErr) throw new Error(`seedOrg: dashboard_users insert failed: ${duErr.message}`);

  return { orgId, userEmail, userPassword, userId };
}

/** Best-effort teardown of a seeded org (cascades remove child rows). */
export async function dropOrg(svc: SupabaseClient, seeded: SeededOrg): Promise<void> {
  try {
    await svc.auth.admin.deleteUser(seeded.userId);
  } catch {
    /* ignore */
  }
  try {
    await svc.from("organizations").delete().eq("id", seeded.orgId);
  } catch {
    /* ignore */
  }
}

/** A minimal end-customer for the org (satisfies NOT NULL FKs on leads/appointments). */
export async function seedCustomer(svc: SupabaseClient, orgId: string, phone: string): Promise<string> {
  const { data, error } = await svc
    .from("end_customers")
    .insert({ org_id: orgId, phone, name: "Test Customer" })
    .select("id")
    .single();
  if (error || !data) throw new Error(`seedCustomer failed: ${error?.message}`);
  return (data as { id: string }).id;
}
