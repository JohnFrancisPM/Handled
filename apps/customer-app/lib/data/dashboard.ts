import "server-only";

import type { DataContext } from "@/lib/data/context";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  APPOINTMENTS,
  CONVERSATIONS,
  CUSTOMERS,
  LEADS,
  NOTIFICATIONS,
  PROFILE_BUNDLE,
  conversationById,
  customerById
} from "@/lib/demo/fixtures";
import type {
  AppointmentListItem,
  AppointmentStatus,
  ConversationListItem,
  ConversationStatus,
  ConversationThread,
  LeadListItem,
  LeadStatus,
  NotificationItem,
  ProfileBundle,
  ThreadMessage,
  ToolCall
} from "@/lib/types";

/**
 * Read-side data access. Each function serves seeded demo fixtures in demo mode
 * and RLS-scoped Supabase rows in live mode (dashboard-api.md). All queries are
 * org-scoped; the live reads rely on the anon client's RLS (current_org_id()).
 */

// ---- Conversations ----
export async function getConversations(
  ctx: DataContext,
  opts: { status?: string } = {}
): Promise<ConversationListItem[]> {
  if (ctx.mode === "demo") {
    let rows = CONVERSATIONS;
    if (opts.status) rows = rows.filter((c) => c.status === opts.status);
    return rows.map((c) => {
      const cust = customerById(c.customerId);
      return {
        id: c.id,
        customer: { name: cust?.name ?? "Unknown", phone: cust?.phone ?? "" },
        last_intent: c.last_intent,
        status: c.status,
        updated_at: c.updated_at
      };
    });
  }

  const supabase = getSupabaseServer();
  if (!supabase) return [];
  let query = supabase
    .from("conversations")
    .select("id, last_intent, status, updated_at, end_customers(name, phone)")
    .eq("org_id", ctx.orgId)
    .order("updated_at", { ascending: false });
  if (opts.status) query = query.eq("status", opts.status);
  const { data } = await query;
  return (data ?? []).map((r: Record<string, unknown>) => {
    const cust = asCustomer(r.end_customers);
    return {
      id: String(r.id),
      customer: { name: cust.name, phone: cust.phone },
      last_intent: (r.last_intent as string) ?? null,
      status: r.status as ConversationStatus,
      updated_at: String(r.updated_at)
    };
  });
}

export async function getConversationThread(
  ctx: DataContext,
  id: string
): Promise<ConversationThread | null> {
  if (ctx.mode === "demo") {
    const conv = conversationById(id);
    if (!conv) return null;
    const cust = customerById(conv.customerId);
    return {
      id: conv.id,
      customer: {
        name: cust?.name ?? "Unknown",
        phone: cust?.phone ?? "",
        address: cust?.address ?? null
      },
      status: conv.status,
      messages: conv.messages
    };
  }

  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, status, end_customers(name, phone, address)")
    .eq("org_id", ctx.orgId)
    .eq("id", id)
    .single();
  if (!conv) return null;
  const { data: messages } = await supabase
    .from("messages")
    .select("id, role, content, intent, reasoning, citation, tool_calls, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });
  const cust = asCustomer((conv as Record<string, unknown>).end_customers);
  return {
    id: String((conv as Record<string, unknown>).id),
    customer: { name: cust.name, phone: cust.phone, address: cust.address },
    status: (conv as Record<string, unknown>).status as ConversationStatus,
    messages: (messages ?? []).map(mapMessage)
  };
}

// ---- Appointments ----
export async function getAppointments(
  ctx: DataContext,
  opts: { status?: string } = {}
): Promise<AppointmentListItem[]> {
  if (ctx.mode === "demo") {
    let rows = APPOINTMENTS;
    if (opts.status) rows = rows.filter((a) => a.status === opts.status);
    return rows
      .slice()
      .sort((a, b) => sortByDateDesc(a.scheduled_at, b.scheduled_at))
      .map((a) => ({
        id: a.id,
        service: a.service,
        tech: a.tech,
        scheduled_at: a.scheduled_at,
        arrival_window: a.arrival_window,
        status: a.status,
        price: a.price,
        confirmed: a.confirmed
      }));
  }

  const supabase = getSupabaseServer();
  if (!supabase) return [];
  let query = supabase
    .from("appointments")
    .select(
      "id, scheduled_at, arrival_window, status, price, confirmed, services(name), technicians(name)"
    )
    .eq("org_id", ctx.orgId)
    .order("scheduled_at", { ascending: false });
  if (opts.status) query = query.eq("status", opts.status);
  const { data } = await query;
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    service: asName(r.services),
    tech: asName(r.technicians),
    scheduled_at: (r.scheduled_at as string) ?? null,
    arrival_window: (r.arrival_window as string) ?? null,
    status: r.status as AppointmentStatus,
    price: r.price == null ? null : Number(r.price),
    confirmed: Boolean(r.confirmed)
  }));
}

// ---- Leads ----
export async function getLeads(
  ctx: DataContext,
  opts: { status?: string } = {}
): Promise<LeadListItem[]> {
  if (ctx.mode === "demo") {
    let rows = LEADS;
    if (opts.status) rows = rows.filter((l) => l.status === opts.status);
    return rows
      .slice()
      .sort((a, b) => sortByDateDesc(a.created_at, b.created_at))
      .map((l) => {
        const cust = customerById(l.customerId);
        return {
          id: l.id,
          customer: cust?.name ?? "Unknown",
          reason: l.reason,
          requested_service: l.requested_service,
          detail: l.detail,
          media_url: l.media_url,
          status: l.status,
          created_at: l.created_at
        };
      });
  }

  const supabase = getSupabaseServer();
  if (!supabase) return [];
  let query = supabase
    .from("leads")
    .select(
      "id, reason, requested_service, detail, media_url, status, created_at, end_customers(name)"
    )
    .eq("org_id", ctx.orgId)
    .order("created_at", { ascending: false });
  if (opts.status) query = query.eq("status", opts.status);
  const { data } = await query;
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    customer: asName(r.end_customers) ?? "Unknown",
    reason: r.reason as LeadListItem["reason"],
    requested_service: (r.requested_service as string) ?? null,
    detail: (r.detail as string) ?? null,
    media_url: (r.media_url as string) ?? null,
    status: r.status as LeadStatus,
    created_at: String(r.created_at)
  }));
}

// ---- Notifications ----
export async function getNotifications(
  ctx: DataContext,
  opts: { read?: boolean } = {}
): Promise<NotificationItem[]> {
  if (ctx.mode === "demo") {
    let rows = NOTIFICATIONS;
    if (opts.read !== undefined) rows = rows.filter((n) => n.read === opts.read);
    return rows
      .slice()
      .sort((a, b) => sortByDateDesc(a.created_at, b.created_at))
      .map((n) => ({
        id: n.id,
        kind: n.kind,
        ref_id: n.ref_id,
        read: n.read,
        created_at: n.created_at
      }));
  }

  const supabase = getSupabaseServer();
  if (!supabase) return [];
  let query = supabase
    .from("notifications")
    .select("id, kind, ref_id, read, created_at")
    .eq("org_id", ctx.orgId)
    .order("created_at", { ascending: false });
  if (opts.read !== undefined) query = query.eq("read", opts.read);
  const { data } = await query;
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    kind: r.kind as NotificationItem["kind"],
    ref_id: (r.ref_id as string) ?? null,
    read: Boolean(r.read),
    created_at: String(r.created_at)
  }));
}

// ---- Profile bundle ----
export async function getProfileBundle(ctx: DataContext): Promise<ProfileBundle> {
  if (ctx.mode === "demo") return PROFILE_BUNDLE;

  const supabase = getSupabaseServer();
  if (!supabase) return PROFILE_BUNDLE;
  const orgId = ctx.orgId;
  const [profile, areas, services, pricing, hours, technicians, rules] = await Promise.all([
    supabase.from("business_profiles").select("*").eq("org_id", orgId).single(),
    supabase.from("service_areas").select("*").eq("org_id", orgId),
    supabase.from("services").select("*").eq("org_id", orgId),
    supabase.from("service_pricing").select("*, services(name)").eq("org_id", orgId),
    supabase.from("business_hours").select("*").eq("org_id", orgId).order("day_of_week"),
    supabase.from("technicians").select("*").eq("org_id", orgId),
    supabase.from("emergency_rules").select("*").eq("org_id", orgId)
  ]);

  const p = (profile.data ?? {}) as Record<string, unknown>;
  const hoursRows = (hours.data ?? []) as Array<Record<string, unknown>>;
  const closedDates = new Set<string>();
  for (const h of hoursRows) {
    for (const d of (h.closed_dates as string[]) ?? []) closedDates.add(d);
  }

  return {
    profile: {
      legal_name: (p.legal_name as string) ?? "",
      trade: (p.trade as string) ?? null,
      base_zip: (p.base_zip as string) ?? null,
      customer_types: (p.customer_types as string[]) ?? [],
      about: (p.about as string) ?? null,
      ai_disclosure_text: (p.ai_disclosure_text as string) ?? null,
      spanish_enabled: Boolean(p.spanish_enabled)
    },
    areas: ((areas.data ?? []) as Array<Record<string, unknown>>).map((a) => ({
      id: String(a.id),
      region: (a.region as string) ?? "",
      zips: (a.zips as string[]) ?? [],
      mode: a.mode as "serve" | "deny"
    })),
    services: ((services.data ?? []) as Array<Record<string, unknown>>).map((s) => ({
      id: String(s.id),
      name: (s.name as string) ?? "",
      category: (s.category as string) ?? null,
      offered: Boolean(s.offered),
      description: (s.description as string) ?? null,
      notes: (s.notes as string) ?? null
    })),
    pricing: ((pricing.data ?? []) as Array<Record<string, unknown>>).map((pr) => ({
      id: String(pr.id),
      service_id: String(pr.service_id),
      service_name: asName(pr.services) ?? "",
      price_min: pr.price_min == null ? null : Number(pr.price_min),
      price_max: pr.price_max == null ? null : Number(pr.price_max),
      unit: pr.unit as "flat" | "hourly" | "starting_at",
      notes: (pr.notes as string) ?? null
    })),
    hours: hoursRows.map((h) => ({
      id: String(h.id),
      day_of_week: Number(h.day_of_week),
      open_time: (h.open_time as string) ?? null,
      close_time: (h.close_time as string) ?? null
    })),
    closed_dates: Array.from(closedDates).sort(),
    technicians: ((technicians.data ?? []) as Array<Record<string, unknown>>).map((t) => ({
      id: String(t.id),
      name: (t.name as string) ?? "",
      skills: (t.skills as string[]) ?? [],
      status: t.status as ProfileBundle["technicians"][number]["status"],
      status_until: (t.status_until as string) ?? null
    })),
    emergency_rules: ((rules.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      keyword_or_pattern: (r.keyword_or_pattern as string) ?? "",
      severity: r.severity as "emergency" | "urgent",
      action: r.action as ProfileBundle["emergency_rules"][number]["action"],
      guidance_text: (r.guidance_text as string) ?? null
    }))
  };
}

// ---- helpers ----
function sortByDateDesc(a: string | null, b: string | null): number {
  return (b ?? "").localeCompare(a ?? "");
}

function asCustomer(value: unknown): { name: string; phone: string; address: string | null } {
  const row = Array.isArray(value) ? value[0] : value;
  const r = (row ?? {}) as Record<string, unknown>;
  return {
    name: (r.name as string) ?? "Unknown",
    phone: (r.phone as string) ?? "",
    address: (r.address as string) ?? null
  };
}

function asName(value: unknown): string | null {
  const row = Array.isArray(value) ? value[0] : value;
  const r = (row ?? {}) as Record<string, unknown>;
  return (r.name as string) ?? null;
}

function mapMessage(r: Record<string, unknown>): ThreadMessage {
  let toolCalls: ToolCall[] | null = null;
  const raw = r.tool_calls;
  if (Array.isArray(raw)) toolCalls = raw as ToolCall[];
  return {
    id: String(r.id),
    role: r.role as ThreadMessage["role"],
    content: (r.content as string) ?? "",
    intent: (r.intent as string) ?? null,
    reasoning: (r.reasoning as string) ?? null,
    citation: (r.citation as string) ?? null,
    tool_calls: toolCalls,
    created_at: String(r.created_at)
  };
}

// Convenience for the customer roster count (overview inbound context).
export function demoCustomerCount(): number {
  return CUSTOMERS.length;
}
