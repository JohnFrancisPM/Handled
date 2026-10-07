import { z } from "zod";

export const TRADES = [
  "Plumbing", "HVAC", "Electrical", "Roofing",
  "Landscaping", "Cleaning", "Pest control", "Garage doors", "Other"
] as const;

export const PLAN_INTEREST = ["starter", "pro", "scale"] as const;

export const leadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(200, "Name is too long"),
  businessName: z.string().trim().min(1, "Please enter your business name").max(200, "Business name is too long"),
  email: z.string().trim().email("Enter a valid email address").max(320),
  phone: z.string().trim().max(40, "Phone is too long").optional().or(z.literal("")),
  trade: z.enum(TRADES).optional().or(z.literal("")),
  weeklyCalls: z.coerce.number().int().min(0).max(100000).optional(),
  planInterest: z.enum(PLAN_INTEREST).optional().or(z.literal("")),
  message: z.string().trim().max(2000, "Message is too long").optional().or(z.literal("")),
  sourcePath: z.string().max(500).optional(),
  // Anti-spam (not stored):
  company: z.string().max(0, "").optional().or(z.literal("")),   // HONEYPOT — must be empty (R24)
  formLoadedAt: z.coerce.number().optional()                      // epoch ms, for min-fill-time (R24)
});

export type LeadInput = z.infer<typeof leadSchema>;

// Server-side refinement for min-fill-time (bots submit instantly).
export const MIN_FILL_MS = 2000;
