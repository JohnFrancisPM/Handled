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
 * Profile write→read round-trip and org-scoped lead update (testing.md
 * §Integration). These assert the DB-layer guarantees the route handlers depend
 * on: `savePanel` writes with the service-role client re-asserting `org_id`, and
 * reads are RLS-scoped to the signed-in owner's org (auth-and-middleware.md).
 */
describe.skipIf(!INTEGRATION_ENABLED)("profile write→read round-trip + lead org-scoping", () => {
  if (!INTEGRATION_ENABLED) it("skipped", () => expect(SKIP_REASON).toBeTruthy());

  let svc: SupabaseClient;
  let orgA: SeededOrg;
  let orgB: SeededOrg;
  let sessionA: SupabaseClient;

  beforeAll(async () => {
    svc = serviceClient();
    orgA = await seedOrg(svc, "org-a-rt");
    orgB = await seedOrg(svc, "org-b-rt");
    // business_profiles has one row per org; ensure org A has one to update.
    await svc
      .from("business_profiles")
      .upsert({ org_id: orgA.orgId, legal_name: "Before" }, { onConflict: "org_id" });

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

  it("a profile identity write is reflected in a subsequent read (round-trip)", async () => {
    // mirrors savePanel('identity'): service-role update scoped to the session org.
    const { error: wErr } = await svc
      .from("business_profiles")
      .update({ legal_name: "Acme Plumbing Updated", spanish_enabled: true })
      .eq("org_id", orgA.orgId);
    expect(wErr).toBeNull();

    // mirrors GET /api/profile: RLS-scoped read as the owner.
    const { data } = await sessionA
      .from("business_profiles")
      .select("legal_name, spanish_enabled")
      .single();
    expect(data?.legal_name).toBe("Acme Plumbing Updated");
    expect(data?.spanish_enabled).toBe(true);
  });

  it("PATCH lead status is org-scoped: an org-A-scoped update cannot touch org B's lead", async () => {
    const custB = await seedCustomer(svc, orgB.orgId, "+15550000003");
    const { data: lead } = await svc
      .from("leads")
      .insert({ org_id: orgB.orgId, end_customer_id: custB, reason: "out_of_area", status: "open" })
      .select("id")
      .single();
    const leadId = (lead as { id: string }).id;

    // patchLeadStatus re-checks org_id from the session; simulate org A trying to
    // work org B's lead — the org_id guard must make it affect zero rows.
    const { data: updated } = await svc
      .from("leads")
      .update({ status: "contacted" })
      .eq("id", leadId)
      .eq("org_id", orgA.orgId) // session org (A) != lead's org (B)
      .select("id");
    expect(updated ?? []).toHaveLength(0);

    // The lead is untouched.
    const { data: after } = await svc.from("leads").select("status").eq("id", leadId).single();
    expect(after?.status).toBe("open");
  });
});
