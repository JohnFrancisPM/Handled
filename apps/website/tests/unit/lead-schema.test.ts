import { describe, it, expect } from "vitest";
import { leadSchema, TRADES, PLAN_INTEREST, MIN_FILL_MS } from "@/lib/validation/lead";

// Returns a map of field -> first error message, or null when the parse succeeds.
function parseErrors(input: unknown): Record<string, string> | null {
  const result = leadSchema.safeParse(input);
  if (result.success) return null;
  const map: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in map)) map[key] = issue.message;
  }
  return map;
}

const valid = {
  name: "Jane Tester",
  businessName: "Jane Plumbing",
  email: "jane@example.com"
};

describe("leadSchema (R23)", () => {
  it("accepts a valid minimal payload", () => {
    const result = leadSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Jane Tester");
      expect(result.data.businessName).toBe("Jane Plumbing");
      expect(result.data.email).toBe("jane@example.com");
    }
  });

  it("reports a specific error for each missing required field", () => {
    expect(parseErrors({ ...valid, name: "" })?.name).toBe("Please enter your name");
    expect(parseErrors({ ...valid, businessName: "" })?.businessName).toBe(
      "Please enter your business name"
    );
    expect(parseErrors({ ...valid, email: "" })?.email).toBe("Enter a valid email address");
  });

  it("rejects an invalid email", () => {
    expect(parseErrors({ ...valid, email: "not-an-email" })?.email).toBe(
      "Enter a valid email address"
    );
  });

  it("rejects name / businessName > 200 chars and message > 2000 chars", () => {
    expect(parseErrors({ ...valid, name: "a".repeat(201) })?.name).toBe("Name is too long");
    expect(parseErrors({ ...valid, businessName: "b".repeat(201) })?.businessName).toBe(
      "Business name is too long"
    );
    expect(parseErrors({ ...valid, message: "m".repeat(2001) })?.message).toBe(
      "Message is too long"
    );
  });

  it("validates weeklyCalls range and coercion", () => {
    expect(parseErrors({ ...valid, weeklyCalls: -1 })?.weeklyCalls).toBeDefined();
    expect(parseErrors({ ...valid, weeklyCalls: 100001 })?.weeklyCalls).toBeDefined();
    expect(leadSchema.safeParse({ ...valid, weeklyCalls: 0 }).success).toBe(true);
    expect(leadSchema.safeParse({ ...valid, weeklyCalls: 50 }).success).toBe(true);

    const coerced = leadSchema.safeParse({ ...valid, weeklyCalls: "25" });
    expect(coerced.success).toBe(true);
    if (coerced.success) expect(coerced.data.weeklyCalls).toBe(25);
  });

  it("validates trade against TRADES and allows an empty selection", () => {
    expect(parseErrors({ ...valid, trade: "NotARealTrade" })?.trade).toBeDefined();
    expect(leadSchema.safeParse({ ...valid, trade: "" }).success).toBe(true);
    expect(leadSchema.safeParse({ ...valid, trade: TRADES[0] }).success).toBe(true);
  });

  it("validates planInterest against the enum", () => {
    expect(parseErrors({ ...valid, planInterest: "gold" })?.planInterest).toBeDefined();
    expect(leadSchema.safeParse({ ...valid, planInterest: PLAN_INTEREST[1] }).success).toBe(true);
    expect(leadSchema.safeParse({ ...valid, planInterest: "pro" }).success).toBe(true);
  });

  it("rejects any honeypot content but allows an empty honeypot", () => {
    expect(parseErrors({ ...valid, company: "spam-bot" })?.company).toBeDefined();
    expect(leadSchema.safeParse({ ...valid, company: "" }).success).toBe(true);
  });

  it("exposes MIN_FILL_MS as the 2s anti-bot threshold", () => {
    expect(MIN_FILL_MS).toBe(2000);
  });
});
