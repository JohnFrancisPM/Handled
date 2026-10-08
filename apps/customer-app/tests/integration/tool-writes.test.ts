import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  TOOL_WRITES_ENABLED,
  N8N_WEBHOOK_URL,
  SKIP_REASON,
  serviceClient,
  seedOrg,
  dropOrg,
  seedCustomer,
  type SeededOrg
} from "./_helpers";

/**
 * n8n tool-write integration (testing.md §Integration — "Webhook context loader
 * returns the full bundle", "create_appointment rejects without confirmed_readback",
 * "capture_lead inserts a leads row + notification").
 *
 * These tools run INSIDE n8n (n8n-tools.md), writing to Supabase. A real
 * integration therefore needs BOTH a test Supabase AND a reachable n8n webhook,
 * so they are guarded by TOOL_WRITES_ENABLED and skip cleanly without env. There
 * is no live n8n/Anthropic key in this environment, so they are NOT executed here.
 */
describe.skipIf(!TOOL_WRITES_ENABLED)("n8n tool writes (webhook → Supabase)", () => {
  if (!TOOL_WRITES_ENABLED) {
    it("skipped (needs TEST_SUPABASE_* + N8N_WEBHOOK_URL)", () =>
      expect(SKIP_REASON).toBeTruthy());
  }

  let svc: SupabaseClient;
  let org: SeededOrg;
  let customerId: string;

  beforeAll(async () => {
    svc = serviceClient();
    org = await seedOrg(svc, "org-tools");
    customerId = await seedCustomer(svc, org.orgId, "+15550000009");
  }, 30_000);

  afterAll(async () => {
    if (svc && org) await dropOrg(svc, org);
  });

  async function postWebhook(payload: Record<string, unknown>) {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET
          ? { "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET }
          : {})
      },
      body: JSON.stringify({ org_id: org.orgId, from: "+15550000009", ...payload })
    });
    return res;
  }

  it("the webhook context loader returns the full bundle (phone/name/address/history + business config)", async () => {
    // n8n-webhook-contract.md: the first node loads the caller + org context bundle.
    const res = await postWebhook({ text: "hello", debug_context: true });
    expect(res.ok).toBe(true);
    const body = (await res.json()) as Record<string, unknown>;
    const ctx = (body.context ?? body) as Record<string, unknown>;
    // Caller identity + org business config must be present.
    expect(ctx).toHaveProperty("customer");
    expect(ctx).toHaveProperty("business");
  });

  it("create_appointment rejects without confirmed_readback", async () => {
    const before = await svc
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.orgId);
    // Ask to book but never confirm the read-back — the tool must not create a row.
    await postWebhook({ text: "Book a drain clearing tomorrow at 9am", confirmed_readback: false });
    const after = await svc
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.orgId);
    expect(after.count ?? 0).toBe(before.count ?? 0);
  });

  it("capture_lead inserts a leads row + a notification", async () => {
    // A quote-only request (unknown price) should capture a lead and notify the owner.
    await postWebhook({ text: "What would a full house repipe cost?" });

    const { data: leads } = await svc
      .from("leads")
      .select("id, reason")
      .eq("org_id", org.orgId)
      .eq("end_customer_id", customerId);
    expect((leads ?? []).length).toBeGreaterThan(0);

    const { data: notifs } = await svc
      .from("notifications")
      .select("id, kind")
      .eq("org_id", org.orgId)
      .eq("kind", "lead");
    expect((notifs ?? []).length).toBeGreaterThan(0);
  });
});
