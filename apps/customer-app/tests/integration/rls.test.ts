import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  INTEGRATION_ENABLED,
  SKIP_REASON,
  serviceClient,
  anonClient,
  seedOrg,
  dropOrg,
  seedCustomer,
  type SeededOrg
} from "./_helpers";

/**
 * RLS cross-org isolation (testing.md §Integration): a user from org A must not
 * be able to read org B's conversations/appointments/customers. Proven with two
 * real orgs + two authenticated anon sessions against a throwaway test Supabase.
 */
describe.skipIf(!INTEGRATION_ENABLED)("RLS cross-org isolation", () => {
  if (!INTEGRATION_ENABLED) it("skipped", () => expect(SKIP_REASON).toBeTruthy());

  let svc: SupabaseClient;
  let orgA: SeededOrg;
  let orgB: SeededOrg;
  let orgBCustomerId: string;
  let sessionA: SupabaseClient;

  beforeAll(async () => {
    svc = serviceClient();
    orgA = await seedOrg(svc, "org-a");
    orgB = await seedOrg(svc, "org-b");

    // Give org B a customer + conversation + appointment to try to read from A.
    orgBCustomerId = await seedCustomer(svc, orgB.orgId, "+15550000002");
    const { data: conv } = await svc
      .from("conversations")
      .insert({ org_id: orgB.orgId, end_customer_id: orgBCustomerId, status: "open" })
      .select("id")
      .single();
    await svc.from("appointments").insert({
      org_id: orgB.orgId,
      end_customer_id: orgBCustomerId,
      status: "booked",
      source_conversation_id: (conv as { id: string } | null)?.id ?? null
    });

    // Sign in as org A's owner — this session is RLS-scoped to org A.
    sessionA = anonClient();
    const { error } = await sessionA.auth.signInWithPassword({
      email: orgA.userEmail,
      password: orgA.userPassword
    });
    if (error) throw new Error(`sign-in A failed: ${error.message}`);
  }, 30_000);

  afterAll(async () => {
    await sessionA?.auth.signOut().catch(() => undefined);
    if (svc) {
      if (orgA) await dropOrg(svc, orgA);
      if (orgB) await dropOrg(svc, orgB);
    }
  });

  it("org A cannot read org B's conversations", async () => {
    const { data } = await sessionA.from("conversations").select("id").eq("org_id", orgB.orgId);
    expect(data ?? []).toHaveLength(0);
  });

  it("org A cannot read org B's appointments", async () => {
    const { data } = await sessionA.from("appointments").select("id").eq("org_id", orgB.orgId);
    expect(data ?? []).toHaveLength(0);
  });

  it("org A cannot read org B's end-customers", async () => {
    const { data } = await sessionA.from("end_customers").select("id").eq("id", orgBCustomerId);
    expect(data ?? []).toHaveLength(0);
  });

  it("org A CAN read its own org row (sanity: RLS is not blocking everything)", async () => {
    const { data } = await sessionA.from("dashboard_users").select("org_id").eq("id", orgA.userId);
    expect(data?.[0]?.org_id).toBe(orgA.orgId);
  });
});
