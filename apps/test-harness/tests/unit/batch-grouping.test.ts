import { describe, it, expect } from "vitest";
import { groupByPhone, matches } from "@/lib/webhook/batch";
import { getScenarios, getCustomerById } from "@/lib/fixtures/load";
import type { Scenario } from "@/lib/fixtures/types";

const scenario = (over: Partial<Scenario>): Scenario => ({
  scenario_id: "x",
  customer_id: "c0000000-0000-0000-0000-000000000001",
  text: "t",
  expected_intent: "book",
  acceptable_intents: ["book"],
  category: "cat",
  severity: "High",
  ...over
});

describe("matches", () => {
  it("passes when returned intent is in acceptable_intents", () => {
    expect(matches(scenario({ acceptable_intents: ["book", "faq"] }), "faq")).toBe(true);
    expect(matches(scenario({ acceptable_intents: ["book"] }), "faq")).toBe(false);
  });
  it("['*'] always passes (even for a null intent)", () => {
    expect(matches(scenario({ acceptable_intents: ["*"] }), null)).toBe(true);
    expect(matches(scenario({ acceptable_intents: ["*"] }), "anything")).toBe(true);
  });
  it("a null intent fails a specific acceptable set", () => {
    expect(matches(scenario({ acceptable_intents: ["book"] }), null)).toBe(false);
  });
});

describe("groupByPhone", () => {
  it("puts same-from_phone scenarios in one group, in fixture order", () => {
    // Jane Doe (01) owns H-01, Ho-04, TH-ex-01 across the real set.
    const groups = groupByPhone(getScenarios());
    const janePhone = getCustomerById("c0000000-0000-0000-0000-000000000001")!.phone;
    const janeGroup = groups.find((g) =>
      g.some((s) => getCustomerById(s.customer_id)?.phone === janePhone)
    )!;
    const ids = janeGroup.map((s) => s.scenario_id);
    expect(ids).toContain("H-01");
    expect(ids).toContain("Ho-04");
    expect(ids).toContain("TH-ex-01");
    // order preserved (as they appear in the scenario set)
    expect(ids.indexOf("H-01")).toBeLessThan(ids.indexOf("Ho-04"));
    expect(ids.indexOf("Ho-04")).toBeLessThan(ids.indexOf("TH-ex-01"));
  });

  it("different phones form separate groups, and all scenarios are covered once", () => {
    const groups = groupByPhone(getScenarios());
    expect(groups.length).toBeGreaterThan(1);
    const total = groups.reduce((n, g) => n + g.length, 0);
    expect(total).toBe(getScenarios().length);
    // each group is a single phone
    for (const g of groups) {
      const phones = new Set(g.map((s) => getCustomerById(s.customer_id)?.phone));
      expect(phones.size).toBe(1);
    }
  });
});
