import { z } from "zod";

/**
 * Shared Zod schemas (dashboard-api.md §Zod schemas). Imported by BOTH the API
 * route handlers (server validation) and the forms (react-hook-form resolver),
 * so the contract can never drift between client and server.
 */

// ---- Profile panels (PUT /api/profile/[panel]) ----
export const ProfileIdentitySchema = z.object({
  legal_name: z.string().min(1, "Business name is required"),
  trade: z.string().min(1, "Trade is required"),
  base_zip: z.string().min(3, "Base ZIP is required"),
  customer_types: z.array(z.string()),
  about: z.string(),
  ai_disclosure_text: z.string().min(1, "AI disclosure text is required"),
  spanish_enabled: z.boolean()
});
export type ProfileIdentityInput = z.infer<typeof ProfileIdentitySchema>;

export const ServiceAreaSchema = z.object({
  region: z.string().min(1, "Region is required"),
  zips: z.array(z.string()),
  mode: z.enum(["serve", "deny"])
});
export const ServiceAreasPanelSchema = z.object({
  areas: z.array(ServiceAreaSchema)
});
export type ServiceAreaInput = z.infer<typeof ServiceAreaSchema>;

export const ServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  category: z.string(),
  offered: z.boolean(),
  description: z.string().optional(),
  notes: z.string().optional()
});
export const ServicesPanelSchema = z.object({
  services: z.array(ServiceSchema)
});
export type ServiceInput = z.infer<typeof ServiceSchema>;

export const ServicePricingSchema = z
  .object({
    service_id: z.string().min(1, "Service is required"),
    price_min: z.coerce.number().min(0, "Must be ≥ 0"),
    price_max: z.coerce.number().min(0, "Must be ≥ 0"),
    unit: z.enum(["flat", "hourly", "starting_at"]),
    notes: z.string().optional()
  })
  .refine((v) => v.price_max >= v.price_min, {
    message: "Max price must be ≥ min price",
    path: ["price_max"]
  });
export const PricingPanelSchema = z.object({
  pricing: z.array(ServicePricingSchema)
});
export type ServicePricingInput = z.infer<typeof ServicePricingSchema>;

export const BusinessHoursSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  open_time: z.string().optional().nullable(),
  close_time: z.string().optional().nullable()
});
export const HoursPanelSchema = z.object({
  hours: z.array(BusinessHoursSchema),
  closed_dates: z.array(z.string())
});
export type BusinessHoursInput = z.infer<typeof BusinessHoursSchema>;

export const TechnicianSchema = z.object({
  name: z.string().min(1, "Name is required"),
  skills: z.array(z.string()),
  status: z.enum(["available", "sick", "vacation", "off"]),
  status_until: z.string().optional().nullable()
});
export const TeamPanelSchema = z.object({
  technicians: z.array(TechnicianSchema)
});
export type TechnicianInput = z.infer<typeof TechnicianSchema>;

export const EmergencyRuleSchema = z.object({
  keyword_or_pattern: z.string().min(1, "Keyword or pattern is required"),
  severity: z.enum(["emergency", "urgent"]),
  action: z.enum(["escalate_oncall", "advise_911", "same_day_priority"]),
  guidance_text: z.string().optional()
});
export const EmergencyPanelSchema = z.object({
  emergency_rules: z.array(EmergencyRuleSchema)
});
export type EmergencyRuleInput = z.infer<typeof EmergencyRuleSchema>;

// ---- Leads (PATCH /api/leads/[id]) ----
export const LeadPatchSchema = z.object({
  status: z.enum(["open", "contacted", "converted", "dismissed"])
});
export type LeadPatchInput = z.infer<typeof LeadPatchSchema>;

// ---- Notifications (PATCH /api/notifications/[id]) ----
export const NotificationPatchSchema = z.object({
  read: z.literal(true)
});

// ---- Analytics query ----
export const ConversionQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d", "all"]).optional().default("30d")
});
export type ConversionRangeInput = z.infer<typeof ConversionQuerySchema>["range"];

// ---- Auth (login form) ----
export const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});
export type LoginInput = z.infer<typeof LoginSchema>;

// ---- Per-panel schema registry (used by the PUT route) ----
export const PANEL_SCHEMAS = {
  identity: ProfileIdentitySchema,
  areas: ServiceAreasPanelSchema,
  services: ServicesPanelSchema,
  pricing: PricingPanelSchema,
  hours: HoursPanelSchema,
  team: TeamPanelSchema,
  emergency: EmergencyPanelSchema
} as const;

export type PanelName = keyof typeof PANEL_SCHEMAS;

export function isPanelName(value: string): value is PanelName {
  return value in PANEL_SCHEMAS;
}
