import "server-only";

import type { DataContext } from "@/lib/data/context";
import { getSupabaseServer } from "@/lib/supabase/server";
import { APPOINTMENTS, CONVERSATIONS } from "@/lib/demo/fixtures";

/**
 * Conversion / North-Star analytics calc (dashboard-api.md §Analytics calc).
 *
 * - inbound = conversations with ≥1 user message, excluding status='spam'
 * - booked = appointments in (booked, completed, closed_won)
 * - closed_won = appointments status='closed_won'
 * - conversion_rate = booked / inbound
 * - revenue = sum(price) where status='closed_won'
 * - captured_opportunity_value (North Star) = sum(price) across booked+closed_won
 *   jobs originating from an inbound conversation (source_conversation_id set)
 */

export type ConversionRange = "7d" | "30d" | "90d" | "all";

export type ConversionMetrics = {
  inbound: number;
  booked: number;
  closed_won: number;
  conversion_rate: number;
  revenue: number;
  captured_opportunity_value: number;
};

const BOOKED_STATUSES = ["booked", "completed", "closed_won"];

function cutoffIso(range: ConversionRange): string | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export async function computeConversion(
  ctx: DataContext,
  range: ConversionRange = "30d"
): Promise<ConversionMetrics> {
  const cutoff = cutoffIso(range);

  if (ctx.mode === "demo") {
    const convos = CONVERSATIONS.filter(
      (c) =>
        c.status !== "spam" &&
        c.messages.some((m) => m.role === "user") &&
        withinCutoff(c.updated_at, cutoff)
    );
    const appts = APPOINTMENTS.filter((a) => withinCutoff(a.scheduled_at, cutoff));

    const inbound = convos.length;
    const bookedJobs = appts.filter((a) => BOOKED_STATUSES.includes(a.status));
    const booked = bookedJobs.length;
    const closedWonJobs = appts.filter((a) => a.status === "closed_won");
    const closed_won = closedWonJobs.length;
    const revenue = sum(closedWonJobs.map((a) => a.price));
    const captured_opportunity_value = sum(
      bookedJobs.filter((a) => a.source_conversation_id != null).map((a) => a.price)
    );

    return {
      inbound,
      booked,
      closed_won,
      conversion_rate: inbound === 0 ? 0 : booked / inbound,
      revenue,
      captured_opportunity_value
    };
  }

  // Live: query Supabase (RLS-scoped by the anon client).
  const supabase = getSupabaseServer();
  if (!supabase) return EMPTY;

  const convoQuery = supabase
    .from("conversations")
    .select("id, status, updated_at")
    .eq("org_id", ctx.orgId)
    .neq("status", "spam");
  const apptQuery = supabase
    .from("appointments")
    .select("status, price, scheduled_at, source_conversation_id")
    .eq("org_id", ctx.orgId);

  const [{ data: convos }, { data: appts }] = await Promise.all([convoQuery, apptQuery]);

  const inboundRows = (convos ?? []).filter((c: Record<string, unknown>) =>
    withinCutoff(c.updated_at as string, cutoff)
  );
  const apptRows = (appts ?? []).filter((a: Record<string, unknown>) =>
    withinCutoff((a.scheduled_at as string) ?? null, cutoff)
  );

  const bookedJobs = apptRows.filter((a: Record<string, unknown>) =>
    BOOKED_STATUSES.includes(a.status as string)
  );
  const closedWonJobs = apptRows.filter(
    (a: Record<string, unknown>) => a.status === "closed_won"
  );
  const inbound = inboundRows.length;
  const booked = bookedJobs.length;

  return {
    inbound,
    booked,
    closed_won: closedWonJobs.length,
    conversion_rate: inbound === 0 ? 0 : booked / inbound,
    revenue: sum(closedWonJobs.map((a: Record<string, unknown>) => toNum(a.price))),
    captured_opportunity_value: sum(
      bookedJobs
        .filter((a: Record<string, unknown>) => a.source_conversation_id != null)
        .map((a: Record<string, unknown>) => toNum(a.price))
    )
  };
}

const EMPTY: ConversionMetrics = {
  inbound: 0,
  booked: 0,
  closed_won: 0,
  conversion_rate: 0,
  revenue: 0,
  captured_opportunity_value: 0
};

function withinCutoff(value: string | null, cutoff: string | null): boolean {
  if (!cutoff) return true;
  if (!value) return false;
  return value >= cutoff;
}

function sum(values: Array<number | null>): number {
  return values.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

function toNum(value: unknown): number | null {
  return value == null ? null : Number(value);
}
