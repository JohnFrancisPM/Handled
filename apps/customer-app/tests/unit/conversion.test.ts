import { describe, it, expect } from "vitest";
import { computeConversion, type ConversionRange } from "@/lib/analytics/conversion";
import type { DataContext } from "@/lib/data/context";
import { CONVERSATIONS, APPOINTMENTS } from "@/lib/demo/fixtures";

/**
 * Conversion analytics unit tests (testing.md §Unit —
 * "inbound/booked/closed_won counts, conversion_rate, revenue, Captured
 * Opportunity Value, range cutoffs"). Runs against demo fixtures (demo ctx).
 *
 * The "all" range is date-independent (no cutoff), so its numbers are asserted
 * exactly; the ranged cutoffs are asserted by monotonicity to stay robust against
 * the fixtures' now-relative dates.
 */

const DEMO: DataContext = { mode: "demo" };
const BOOKED_STATUSES = ["booked", "completed", "closed_won"];

// Derive the expected "all"-range numbers straight from the fixtures so the test
// documents the calc rather than hard-coding magic constants.
const expectedAll = (() => {
  const inbound = CONVERSATIONS.filter(
    (c) => c.status !== "spam" && c.messages.some((m) => m.role === "user")
  ).length;
  const bookedJobs = APPOINTMENTS.filter((a) => BOOKED_STATUSES.includes(a.status));
  const closedWonJobs = APPOINTMENTS.filter((a) => a.status === "closed_won");
  const revenue = closedWonJobs.reduce((acc, a) => acc + (a.price ?? 0), 0);
  const captured = bookedJobs
    .filter((a) => a.source_conversation_id != null)
    .reduce((acc, a) => acc + (a.price ?? 0), 0);
  return {
    inbound,
    booked: bookedJobs.length,
    closed_won: closedWonJobs.length,
    revenue,
    captured_opportunity_value: captured,
    conversion_rate: bookedJobs.length / inbound
  };
})();

describe("computeConversion (demo, range=all)", () => {
  it("counts inbound = non-spam conversations with a user message", async () => {
    const m = await computeConversion(DEMO, "all");
    expect(m.inbound).toBe(expectedAll.inbound);
    // spam conversations are excluded from inbound
    expect(m.inbound).toBeLessThan(CONVERSATIONS.length);
  });

  it("counts booked = booked + completed + closed_won appointments", async () => {
    const m = await computeConversion(DEMO, "all");
    expect(m.booked).toBe(expectedAll.booked);
  });

  it("counts closed_won appointments", async () => {
    const m = await computeConversion(DEMO, "all");
    expect(m.closed_won).toBe(expectedAll.closed_won);
  });

  it("sums revenue from closed_won prices only", async () => {
    const m = await computeConversion(DEMO, "all");
    expect(m.revenue).toBe(expectedAll.revenue);
  });

  it("computes Captured Opportunity Value from booked jobs with a source conversation", async () => {
    const m = await computeConversion(DEMO, "all");
    expect(m.captured_opportunity_value).toBe(expectedAll.captured_opportunity_value);
    // captured excludes the historical (null-source) closed-won jobs, so it's < total booked value
    const totalBookedValue = APPOINTMENTS.filter((a) => BOOKED_STATUSES.includes(a.status)).reduce(
      (acc, a) => acc + (a.price ?? 0),
      0
    );
    expect(m.captured_opportunity_value).toBeLessThan(totalBookedValue);
  });

  it("computes conversion_rate = booked / inbound", async () => {
    const m = await computeConversion(DEMO, "all");
    expect(m.conversion_rate).toBeCloseTo(expectedAll.conversion_rate, 6);
  });
});

describe("computeConversion range cutoffs (demo)", () => {
  it("is monotonic non-decreasing as the window widens", async () => {
    const ranges: ConversionRange[] = ["7d", "30d", "90d", "all"];
    const results = await Promise.all(ranges.map((r) => computeConversion(DEMO, r)));
    for (let i = 1; i < results.length; i++) {
      const cur = results[i]!;
      const prev = results[i - 1]!;
      expect(cur.inbound).toBeGreaterThanOrEqual(prev.inbound);
      expect(cur.booked).toBeGreaterThanOrEqual(prev.booked);
      expect(cur.revenue).toBeGreaterThanOrEqual(prev.revenue);
    }
  });

  it("the 7d window is strictly narrower than all-time (older closed jobs exist)", async () => {
    const [seven, all] = await Promise.all([
      computeConversion(DEMO, "7d"),
      computeConversion(DEMO, "all")
    ]);
    // Several closed_won jobs are dated well beyond 7 days (down to -70d), so the
    // 7d window must drop some booked jobs and revenue versus all-time.
    expect(seven.booked).toBeLessThan(all.booked);
    expect(seven.revenue).toBeLessThan(all.revenue);
  });

  it("defaults to the 30d window", async () => {
    const def = await computeConversion(DEMO);
    const thirty = await computeConversion(DEMO, "30d");
    expect(def).toEqual(thirty);
  });

  it("never divides by zero (conversion_rate is a finite number)", async () => {
    const m = await computeConversion(DEMO, "7d");
    expect(Number.isFinite(m.conversion_rate)).toBe(true);
  });
});
