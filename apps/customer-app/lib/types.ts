/**
 * Shared domain + API types (dashboard-api.md). These describe both the DB-shaped
 * rows the data layer reads (Supabase or seeded demo fixtures) and the typed
 * envelopes the API returns to the client.
 */

// ---- API envelope (dashboard-api.md §Error envelope) ----
export type ApiErrorCode =
  | "unauthorized"
  | "not_found"
  | "validation"
  | "server";

export type ApiError = { code: ApiErrorCode; message: string };

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

// ---- Domain enums (mirror supabase-schema.sql CHECK constraints) ----
export type ConversationStatus =
  | "open"
  | "booked"
  | "closed"
  | "escalated"
  | "spam";

export type AppointmentStatus =
  | "requested"
  | "booked"
  | "completed"
  | "closed_won"
  | "cancelled"
  | "no_show";

export type LeadReason =
  | "unknown_price"
  | "out_of_area"
  | "recurring_plan"
  | "unknown_warranty"
  | "callback"
  | "photo_followup"
  | "other";

export type LeadStatus = "open" | "contacted" | "converted" | "dismissed";

export type NotificationKind =
  | "new_booking"
  | "escalation"
  | "after_hours_summary"
  | "lead";

export type MessageRole = "user" | "assistant" | "system";

export type TechnicianStatus = "available" | "sick" | "vacation" | "off";

export type ServiceAreaMode = "serve" | "deny";

export type PricingUnit = "flat" | "hourly" | "starting_at";

export type EmergencySeverity = "emergency" | "urgent";

export type EmergencyAction =
  | "escalate_oncall"
  | "advise_911"
  | "same_day_priority";

// ---- API response shapes ----
export type ConversationListItem = {
  id: string;
  customer: { name: string; phone: string };
  last_intent: string | null;
  status: ConversationStatus;
  updated_at: string;
};

export type ToolCall = {
  tool: string;
  args?: Record<string, unknown>;
  result?: unknown;
};

export type ThreadMessage = {
  id: string;
  role: MessageRole;
  content: string;
  intent: string | null;
  reasoning: string | null;
  citation: string | null;
  tool_calls: ToolCall[] | null;
  created_at: string;
};

export type ConversationThread = {
  id: string;
  customer: { name: string; phone: string; address: string | null };
  status: ConversationStatus;
  messages: ThreadMessage[];
};

export type AppointmentListItem = {
  id: string;
  service: string | null;
  tech: string | null;
  scheduled_at: string | null;
  arrival_window: string | null;
  status: AppointmentStatus;
  price: number | null;
  confirmed: boolean;
};

export type LeadListItem = {
  id: string;
  customer: string;
  reason: LeadReason;
  requested_service: string | null;
  detail: string | null;
  media_url: string | null;
  status: LeadStatus;
  created_at: string;
};

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  ref_id: string | null;
  read: boolean;
  created_at: string;
};

// ---- Profile bundle (dashboard-api.md GET /api/profile) ----
export type BusinessProfile = {
  legal_name: string;
  trade: string | null;
  base_zip: string | null;
  customer_types: string[];
  about: string | null;
  ai_disclosure_text: string | null;
  spanish_enabled: boolean;
};

export type ServiceArea = {
  id: string;
  region: string;
  zips: string[];
  mode: ServiceAreaMode;
};

export type Service = {
  id: string;
  name: string;
  category: string | null;
  offered: boolean;
  description: string | null;
  notes: string | null;
};

export type ServicePricing = {
  id: string;
  service_id: string;
  service_name: string;
  price_min: number | null;
  price_max: number | null;
  unit: PricingUnit;
  notes: string | null;
};

export type BusinessHours = {
  id: string;
  day_of_week: number; // 0 = Sunday
  open_time: string | null;
  close_time: string | null;
};

export type Technician = {
  id: string;
  name: string;
  skills: string[];
  status: TechnicianStatus;
  status_until: string | null;
};

export type EmergencyRule = {
  id: string;
  keyword_or_pattern: string;
  severity: EmergencySeverity;
  action: EmergencyAction;
  guidance_text: string | null;
};

export type ProfileBundle = {
  profile: BusinessProfile;
  areas: ServiceArea[];
  services: Service[];
  pricing: ServicePricing[];
  hours: BusinessHours[];
  closed_dates: string[];
  technicians: Technician[];
  emergency_rules: EmergencyRule[];
};
