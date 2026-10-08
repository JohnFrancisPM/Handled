import { describe, it, expect } from "vitest";
import {
  CUSTOMERS,
  CONVERSATIONS,
  APPOINTMENTS,
  LEADS,
  NOTIFICATIONS,
  PROFILE_BUNDLE,
  DEMO_ORG,
  customerById,
  conversationById
} from "@/lib/demo/fixtures";

/**
 * Demo fixture consistency (testing.md §Unit — "fixtures are internally
 * consistent (FKs resolve, appointments reference real conversations, funnel
 * numbers coherent)"). seed-data.md promises Acme + 30 customers spanning the
 * eval types; these guards keep the demo from drifting out of referential shape.
 */

const customerIds = new Set(CUSTOMERS.map((c) => c.id));
const conversationIds = new Set(CONVERSATIONS.map((c) => c.id));

describe("roster", () => {
  it("has the seeded org + 30 end-customers", () => {
    expect(DEMO_ORG.slug).toBe("acme-plumbing");
    expect(CUSTOMERS).toHaveLength(30);
  });

  it("has unique customer ids and phone numbers", () => {
    expect(customerIds.size).toBe(CUSTOMERS.length);
    const phones = new Set(CUSTOMERS.map((c) => c.phone));
    expect(phones.size).toBe(CUSTOMERS.length);
  });
});

describe("conversation FKs", () => {
  it("every conversation references a real customer", () => {
    for (const c of CONVERSATIONS) {
      expect(customerIds.has(c.customerId), `conversation ${c.id}`).toBe(true);
    }
  });

  it("every conversation has at least one message with the first from the user", () => {
    for (const c of CONVERSATIONS) {
      expect(c.messages.length, `conversation ${c.id}`).toBeGreaterThan(0);
      expect(c.messages[0]!.role).toBe("user");
    }
  });

  it("conversation ids are unique and look-up helpers resolve", () => {
    expect(conversationIds.size).toBe(CONVERSATIONS.length);
    expect(conversationById("conv-c01")?.customerId).toBe("c01");
    expect(customerById("c01")?.name).toBe("Jane Doe");
  });

  it("assistant explainability turns carry reasoning or citation (eval fields)", () => {
    const assistantTurns = CONVERSATIONS.flatMap((c) =>
      c.messages.filter((m) => m.role === "assistant")
    );
    expect(assistantTurns.length).toBeGreaterThan(0);
    for (const m of assistantTurns) {
      expect(Boolean(m.reasoning || m.citation), `message ${m.id}`).toBe(true);
    }
  });
});

describe("appointment FKs", () => {
  it("every appointment references a real customer", () => {
    for (const a of APPOINTMENTS) {
      expect(customerIds.has(a.customerId), `appointment ${a.id}`).toBe(true);
    }
  });

  it("every appointment source_conversation_id (when set) references a real conversation", () => {
    for (const a of APPOINTMENTS) {
      if (a.source_conversation_id != null) {
        expect(conversationIds.has(a.source_conversation_id), `appointment ${a.id}`).toBe(true);
      }
    }
  });

  it("closed_won + booked appointments carry a price; requested/cancelled may not", () => {
    for (const a of APPOINTMENTS) {
      if (a.status === "closed_won" || a.status === "booked") {
        expect(typeof a.price, `appointment ${a.id}`).toBe("number");
      }
    }
  });
});

describe("lead + notification FKs", () => {
  it("every lead references a real customer", () => {
    for (const l of LEADS) {
      expect(customerIds.has(l.customerId), `lead ${l.id}`).toBe(true);
    }
  });

  it("notifications referencing an appointment/lead resolve to a real row", () => {
    const apptIds = new Set(APPOINTMENTS.map((a) => a.id));
    const leadIds = new Set(LEADS.map((l) => l.id));
    for (const n of NOTIFICATIONS) {
      if (n.kind === "new_booking" && n.ref_id) {
        expect(apptIds.has(n.ref_id), `notification ${n.id}`).toBe(true);
      }
      if (n.kind === "lead" && n.ref_id) {
        expect(leadIds.has(n.ref_id), `notification ${n.id}`).toBe(true);
      }
    }
  });
});

describe("profile bundle coherence", () => {
  it("has serve and deny service areas", () => {
    const modes = new Set(PROFILE_BUNDLE.areas.map((a) => a.mode));
    expect(modes.has("serve")).toBe(true);
    expect(modes.has("deny")).toBe(true);
  });

  it("has offered and won't-provide services so the agent can decline honestly", () => {
    expect(PROFILE_BUNDLE.services.some((s) => s.offered)).toBe(true);
    expect(PROFILE_BUNDLE.services.some((s) => !s.offered)).toBe(true);
  });

  it("has exactly one sick and one vacation technician (seed-data.md)", () => {
    const sick = PROFILE_BUNDLE.technicians.filter((t) => t.status === "sick");
    const vacation = PROFILE_BUNDLE.technicians.filter((t) => t.status === "vacation");
    expect(sick).toHaveLength(1);
    expect(vacation).toHaveLength(1);
  });

  it("every pricing row references a real service", () => {
    const serviceIds = new Set(PROFILE_BUNDLE.services.map((s) => s.id));
    for (const p of PROFILE_BUNDLE.pricing) {
      expect(serviceIds.has(p.service_id), `pricing ${p.id}`).toBe(true);
    }
  });

  it("has 7 rows of business hours (one per weekday)", () => {
    const days = new Set(PROFILE_BUNDLE.hours.map((h) => h.day_of_week));
    expect(days.size).toBe(7);
  });
});

describe("funnel coherence", () => {
  const closedWon = APPOINTMENTS.filter((a) => a.status === "closed_won");
  const booked = APPOINTMENTS.filter((a) =>
    ["booked", "completed", "closed_won"].includes(a.status)
  );
  const nonSpamInbound = CONVERSATIONS.filter(
    (c) => c.status !== "spam" && c.messages.some((m) => m.role === "user")
  );

  it("closed_won ⊆ booked ⊆ inbound (monotonic funnel)", () => {
    expect(closedWon.length).toBeLessThanOrEqual(booked.length);
    expect(booked.length).toBeLessThanOrEqual(nonSpamInbound.length);
  });

  it("there is realisable revenue and captured opportunity value", () => {
    const revenue = closedWon.reduce((acc, a) => acc + (a.price ?? 0), 0);
    expect(revenue).toBeGreaterThan(0);
    const captured = booked
      .filter((a) => a.source_conversation_id != null)
      .reduce((acc, a) => acc + (a.price ?? 0), 0);
    expect(captured).toBeGreaterThan(0);
  });
});
