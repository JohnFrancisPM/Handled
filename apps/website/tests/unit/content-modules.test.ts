import { describe, it, expect } from "vitest";
import { pricingTiers } from "@/content/pricing";
import { missedCallStats } from "@/content/stats";
import { pricingComparison } from "@/content/comparison";
import { differentiators } from "@/content/differentiators";
import { features } from "@/content/features";
import { site } from "@/content/site";
import { TRADES } from "@/lib/validation/lead";
import { iconMap } from "@/components/marketing/iconMap";

describe("pricingTiers", () => {
  it("has exactly 3 tiers at the expected prices", () => {
    expect(pricingTiers).toHaveLength(3);
    expect(pricingTiers.map((t) => t.price)).toEqual(["$149", "$299", "$599"]);
  });

  it("marks exactly one tier (Pro) as most popular with the prefill CTA", () => {
    const popular = pricingTiers.filter((t) => t.mostPopular);
    expect(popular).toHaveLength(1);
    expect(popular[0]?.id).toBe("pro");
    expect(popular[0]?.cta.href).toBe("/contact?plan=pro");
  });
});

describe("missedCallStats", () => {
  it("has the 5 PRD stat values", () => {
    expect(missedCallStats).toHaveLength(5);
    expect(missedCallStats.map((s) => s.value)).toEqual([
      "27%",
      "52%",
      "62%",
      "85%",
      "~$1,200"
    ]);
  });
});

describe("pricingComparison", () => {
  it("includes reception.ai at $199 and Smith.ai at $300", () => {
    const reception = pricingComparison.find((r) => /reception\.ai/i.test(r.product));
    const smith = pricingComparison.find((r) => /smith\.ai/i.test(r.product));
    expect(reception?.price).toContain("$199");
    expect(smith?.price).toContain("$300");
  });

  it("highlights exactly one row (Handled)", () => {
    const highlighted = pricingComparison.filter((r) => r.highlight === true);
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]?.product).toMatch(/handled/i);
  });
});

describe("differentiators", () => {
  it("has 4 entries, each with non-empty points", () => {
    expect(differentiators).toHaveLength(4);
    for (const d of differentiators) {
      expect(d.points.length).toBeGreaterThan(0);
      for (const point of d.points) {
        expect(point.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("site + content integrity", () => {
  it("site.trades equals the TRADES validation constant", () => {
    expect([...site.trades]).toEqual([...TRADES]);
  });

  it("every feature icon resolves in the iconMap", () => {
    for (const feature of features) {
      expect(iconMap[feature.icon], `missing icon: ${feature.icon}`).toBeDefined();
    }
  });
});
