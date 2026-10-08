import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getScenarios } from "@/lib/fixtures/load";
import { getCustomerById } from "@/lib/fixtures/load";

// eval-cases.json lives in the customer-app; read it directly (cwd = apps/test-harness).
const evalCasesRaw = JSON.parse(
  readFileSync(resolve(process.cwd(), "..", "customer-app", "tests", "eval", "eval-cases.json"), "utf8")
);
const evalArray: Array<Record<string, unknown>> = Array.isArray(evalCasesRaw)
  ? evalCasesRaw
  : (Object.values(evalCasesRaw).find(Array.isArray) as Array<Record<string, unknown>>);
const evalCaseIds = evalArray.map((c) => (c.case_id ?? c.id) as string);

describe("scenarios.json", () => {
  const scenarios = getScenarios();

  it("contains every case_id from eval-cases.json (no case dropped)", () => {
    const present = new Set(scenarios.map((s) => s.scenario_id));
    const missing = evalCaseIds.filter((id) => !present.has(id));
    expect(missing).toEqual([]);
  });

  it("has exactly 5 extras, all tagged expected_intent '*' / acceptable ['*']", () => {
    const extras = scenarios.filter((s) => s.scenario_id.startsWith("TH-ex"));
    expect(extras).toHaveLength(5);
    for (const e of extras) {
      expect(e.expected_intent).toBe("*");
      expect(e.acceptable_intents).toEqual(["*"]);
    }
  });

  it("scenario_count equals 50 eval cases + 5 extras", () => {
    expect(scenarios).toHaveLength(evalCaseIds.length + 5);
    expect(evalCaseIds).toHaveLength(50);
  });

  it("every scenario.customer_id resolves to a fixture customer", () => {
    for (const s of scenarios) {
      expect(getCustomerById(s.customer_id), `missing customer for ${s.scenario_id}`).toBeDefined();
    }
  });
});
