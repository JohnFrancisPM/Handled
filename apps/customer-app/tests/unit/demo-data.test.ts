import { describe, it, expect } from "vitest";
import type { DataContext } from "@/lib/data/context";
import { isReadOnly } from "@/lib/data/context";
import {
  getConversations,
  getConversationThread,
  getAppointments,
  getLeads,
  getNotifications,
  getProfileBundle,
  demoCustomerCount
} from "@/lib/data/dashboard";
import { patchLeadStatus, markNotificationRead, savePanel } from "@/lib/data/mutations";
import { CONVERSATIONS, APPOINTMENTS, LEADS, PROFILE_BUNDLE } from "@/lib/demo/fixtures";

/**
 * Demo-mode read + write behavior (testing.md §Unit — "demo-mode read layer
 * returns seeded data and demo mutations no-op without throwing").
 */

const DEMO: DataContext = { mode: "demo" };

describe("demo read layer returns seeded data", () => {
  it("getConversations returns all seeded conversations", async () => {
    const rows = await getConversations(DEMO);
    expect(rows).toHaveLength(CONVERSATIONS.length);
    expect(rows[0]!.customer.name).toBeTruthy();
  });

  it("getConversations filters by status", async () => {
    const escalated = await getConversations(DEMO, { status: "escalated" });
    expect(escalated.length).toBeGreaterThan(0);
    expect(escalated.every((c) => c.status === "escalated")).toBe(true);
  });

  it("getConversationThread resolves a seeded thread with messages + customer", async () => {
    const thread = await getConversationThread(DEMO, "conv-c16");
    expect(thread).not.toBeNull();
    expect(thread?.messages.length).toBeGreaterThan(0);
    expect(thread?.customer.name).toBe("Mark Dunn");
  });

  it("getConversationThread returns null for an unknown id", async () => {
    expect(await getConversationThread(DEMO, "conv-nope")).toBeNull();
  });

  it("getAppointments returns seeded appointments and filters by status", async () => {
    const all = await getAppointments(DEMO);
    expect(all).toHaveLength(APPOINTMENTS.length);
    const won = await getAppointments(DEMO, { status: "closed_won" });
    expect(won.every((a) => a.status === "closed_won")).toBe(true);
  });

  it("getLeads returns seeded leads", async () => {
    const leads = await getLeads(DEMO);
    expect(leads).toHaveLength(LEADS.length);
  });

  it("getNotifications filters by read flag", async () => {
    const unread = await getNotifications(DEMO, { read: false });
    expect(unread.every((n) => n.read === false)).toBe(true);
  });

  it("getProfileBundle returns the seeded Acme bundle", async () => {
    const bundle = await getProfileBundle(DEMO);
    expect(bundle).toBe(PROFILE_BUNDLE);
    expect(bundle.profile.legal_name).toBe("Acme Plumbing");
  });

  it("demoCustomerCount reports the 30-customer roster", () => {
    expect(demoCustomerCount()).toBe(30);
  });
});

describe("demo mode is read-only and mutations no-op without throwing", () => {
  it("isReadOnly is true in demo mode", () => {
    expect(isReadOnly(DEMO)).toBe(true);
  });

  it("patchLeadStatus resolves true (no-op) in demo", async () => {
    await expect(patchLeadStatus(DEMO, "lead-14", "contacted")).resolves.toBe(true);
  });

  it("markNotificationRead resolves true (no-op) in demo", async () => {
    await expect(markNotificationRead(DEMO, "ntf-1")).resolves.toBe(true);
  });

  it("savePanel resolves true (no-op) for every panel in demo", async () => {
    await expect(savePanel(DEMO, "identity", { legal_name: "x" })).resolves.toBe(true);
    await expect(savePanel(DEMO, "pricing", { pricing: [] })).resolves.toBe(true);
    await expect(savePanel(DEMO, "hours", { hours: [], closed_dates: [] })).resolves.toBe(true);
  });
});
