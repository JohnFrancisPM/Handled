import { describe, it, expect } from "vitest";
import {
  ProfileIdentitySchema,
  ServiceAreasPanelSchema,
  ServicesPanelSchema,
  ServicePricingSchema,
  PricingPanelSchema,
  HoursPanelSchema,
  TeamPanelSchema,
  EmergencyPanelSchema,
  LeadPatchSchema,
  NotificationPatchSchema,
  ConversionQuerySchema,
  LoginSchema,
  PANEL_SCHEMAS,
  isPanelName
} from "@/lib/schemas";

/**
 * Zod schema unit tests (testing.md §Unit — "valid/invalid cases for each panel
 * schema incl. the price_max >= price_min refine, LeadPatch, ConversionQuery,
 * Login"). Contract shared by API routes + RHF resolvers, so these guard drift.
 */

describe("ProfileIdentitySchema", () => {
  const valid = {
    legal_name: "Acme Plumbing",
    trade: "residential plumbing",
    base_zip: "11375",
    customer_types: ["homeowners"],
    about: "About us",
    ai_disclosure_text: "You're chatting with our AI.",
    spanish_enabled: true
  };

  it("accepts a complete valid identity", () => {
    expect(ProfileIdentitySchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a blank business name", () => {
    expect(ProfileIdentitySchema.safeParse({ ...valid, legal_name: "" }).success).toBe(false);
  });

  it("rejects a too-short base_zip", () => {
    expect(ProfileIdentitySchema.safeParse({ ...valid, base_zip: "11" }).success).toBe(false);
  });

  it("rejects a blank ai_disclosure_text", () => {
    expect(ProfileIdentitySchema.safeParse({ ...valid, ai_disclosure_text: "" }).success).toBe(false);
  });
});

describe("ServiceAreasPanelSchema", () => {
  it("accepts serve/deny areas", () => {
    const res = ServiceAreasPanelSchema.safeParse({
      areas: [
        { region: "Queens", zips: ["11375"], mode: "serve" },
        { region: "Bronx", zips: [], mode: "deny" }
      ]
    });
    expect(res.success).toBe(true);
  });

  it("rejects an invalid mode", () => {
    const res = ServiceAreasPanelSchema.safeParse({
      areas: [{ region: "Queens", zips: [], mode: "maybe" }]
    });
    expect(res.success).toBe(false);
  });

  it("rejects a blank region", () => {
    const res = ServiceAreasPanelSchema.safeParse({
      areas: [{ region: "", zips: [], mode: "serve" }]
    });
    expect(res.success).toBe(false);
  });
});

describe("ServicesPanelSchema", () => {
  it("accepts offered + won't-provide services", () => {
    const res = ServicesPanelSchema.safeParse({
      services: [
        { name: "Drain clearing", category: "drain", offered: true },
        { name: "Commercial", category: "commercial", offered: false, notes: "not serviced" }
      ]
    });
    expect(res.success).toBe(true);
  });

  it("rejects a service with no name", () => {
    const res = ServicesPanelSchema.safeParse({
      services: [{ name: "", category: "drain", offered: true }]
    });
    expect(res.success).toBe(false);
  });
});

describe("ServicePricingSchema — price_max >= price_min refine", () => {
  const base = { service_id: "svc-drain", price_min: 150, price_max: 450, unit: "starting_at" };

  it("accepts max >= min", () => {
    expect(ServicePricingSchema.safeParse(base).success).toBe(true);
  });

  it("accepts max == min", () => {
    expect(ServicePricingSchema.safeParse({ ...base, price_min: 200, price_max: 200 }).success).toBe(
      true
    );
  });

  it("rejects max < min and points the error at price_max", () => {
    const res = ServicePricingSchema.safeParse({ ...base, price_min: 500, price_max: 100 });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.path).toContain("price_max");
    }
  });

  it("coerces numeric strings (RHF inputs) and still refines", () => {
    const res = ServicePricingSchema.safeParse({
      ...base,
      price_min: "100",
      price_max: "90"
    });
    expect(res.success).toBe(false);
  });

  it("rejects a negative price", () => {
    expect(ServicePricingSchema.safeParse({ ...base, price_min: -1 }).success).toBe(false);
  });

  it("rejects an unknown unit", () => {
    expect(ServicePricingSchema.safeParse({ ...base, unit: "per_hour" }).success).toBe(false);
  });

  it("wraps rows in PricingPanelSchema", () => {
    expect(PricingPanelSchema.safeParse({ pricing: [base] }).success).toBe(true);
  });
});

describe("HoursPanelSchema", () => {
  it("accepts a week of hours + closed dates", () => {
    const res = HoursPanelSchema.safeParse({
      hours: [
        { day_of_week: 0, open_time: null, close_time: null },
        { day_of_week: 1, open_time: "08:00", close_time: "18:00" }
      ],
      closed_dates: ["2026-12-25"]
    });
    expect(res.success).toBe(true);
  });

  it("rejects day_of_week out of range", () => {
    const res = HoursPanelSchema.safeParse({
      hours: [{ day_of_week: 7, open_time: null, close_time: null }],
      closed_dates: []
    });
    expect(res.success).toBe(false);
  });
});

describe("TeamPanelSchema", () => {
  it("accepts technicians with statuses", () => {
    const res = TeamPanelSchema.safeParse({
      technicians: [
        { name: "Mike", skills: ["drain"], status: "available", status_until: null },
        { name: "Tony", skills: ["gas_heating"], status: "sick", status_until: "2026-10-07" }
      ]
    });
    expect(res.success).toBe(true);
  });

  it("rejects an invalid technician status", () => {
    const res = TeamPanelSchema.safeParse({
      technicians: [{ name: "Mike", skills: [], status: "busy" }]
    });
    expect(res.success).toBe(false);
  });
});

describe("EmergencyPanelSchema", () => {
  it("accepts emergency rules", () => {
    const res = EmergencyPanelSchema.safeParse({
      emergency_rules: [
        { keyword_or_pattern: "gas", severity: "emergency", action: "escalate_oncall" }
      ]
    });
    expect(res.success).toBe(true);
  });

  it("rejects an invalid severity", () => {
    const res = EmergencyPanelSchema.safeParse({
      emergency_rules: [
        { keyword_or_pattern: "gas", severity: "critical", action: "escalate_oncall" }
      ]
    });
    expect(res.success).toBe(false);
  });

  it("rejects an invalid action", () => {
    const res = EmergencyPanelSchema.safeParse({
      emergency_rules: [{ keyword_or_pattern: "gas", severity: "emergency", action: "ignore" }]
    });
    expect(res.success).toBe(false);
  });
});

describe("LeadPatchSchema", () => {
  it.each(["open", "contacted", "converted", "dismissed"])("accepts status %s", (status) => {
    expect(LeadPatchSchema.safeParse({ status }).success).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(LeadPatchSchema.safeParse({ status: "archived" }).success).toBe(false);
  });

  it("rejects a missing status", () => {
    expect(LeadPatchSchema.safeParse({}).success).toBe(false);
  });
});

describe("NotificationPatchSchema", () => {
  it("accepts read: true literal", () => {
    expect(NotificationPatchSchema.safeParse({ read: true }).success).toBe(true);
  });

  it("rejects read: false", () => {
    expect(NotificationPatchSchema.safeParse({ read: false }).success).toBe(false);
  });
});

describe("ConversionQuerySchema", () => {
  it.each(["7d", "30d", "90d", "all"])("accepts range %s", (range) => {
    expect(ConversionQuerySchema.safeParse({ range }).success).toBe(true);
  });

  it("defaults to 30d when range is omitted", () => {
    const res = ConversionQuerySchema.safeParse({});
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.range).toBe("30d");
  });

  it("rejects an unknown range", () => {
    expect(ConversionQuerySchema.safeParse({ range: "ytd" }).success).toBe(false);
  });
});

describe("LoginSchema", () => {
  it("accepts a valid email + password", () => {
    expect(LoginSchema.safeParse({ email: "mike@acme.com", password: "x" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(LoginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(LoginSchema.safeParse({ email: "mike@acme.com", password: "" }).success).toBe(false);
  });
});

describe("PANEL_SCHEMAS registry", () => {
  it("exposes all seven policy panels", () => {
    expect(Object.keys(PANEL_SCHEMAS).sort()).toEqual(
      ["areas", "emergency", "hours", "identity", "pricing", "services", "team"].sort()
    );
  });

  it("isPanelName guards unknown panels", () => {
    expect(isPanelName("identity")).toBe(true);
    expect(isPanelName("nope")).toBe(false);
  });
});
