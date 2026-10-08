import "server-only";

import type { DataContext } from "@/lib/data/context";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { LeadStatus, NotificationKind } from "@/lib/types";
import type { PanelName } from "@/lib/schemas";

/**
 * Write-side data access. In demo mode every write is a graceful no-op (the UI
 * stays optimistic, nothing crashes). In live mode writes use the service-role
 * client and re-check `org_id` from the session (auth-and-middleware.md §Authz).
 */

export async function patchLeadStatus(
  ctx: DataContext,
  leadId: string,
  status: LeadStatus
): Promise<boolean> {
  if (ctx.mode === "demo") return true; // read-only demo: optimistic no-op
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  const { error } = await admin
    .from("leads")
    .update({ status })
    .eq("id", leadId)
    .eq("org_id", ctx.orgId); // re-check org from session; never trust client org_id
  return !error;
}

export async function markNotificationRead(
  ctx: DataContext,
  notificationId: string
): Promise<boolean> {
  if (ctx.mode === "demo") return true;
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  const { error } = await admin
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("org_id", ctx.orgId);
  return !error;
}

/**
 * Save a policy panel. Config tables are owner-self-serve; writes re-assert
 * org_id. Array panels are replace-in-place (delete org rows, insert new set).
 */
export async function savePanel(
  ctx: DataContext,
  panel: PanelName,
  data: unknown
): Promise<boolean> {
  if (ctx.mode === "demo") return true;
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  const orgId = ctx.orgId;

  switch (panel) {
    case "identity": {
      const { error } = await admin
        .from("business_profiles")
        .update(data as Record<string, unknown>)
        .eq("org_id", orgId);
      return !error;
    }
    case "areas":
      return replaceRows(admin, "service_areas", orgId, (data as { areas: unknown[] }).areas);
    case "services":
      return replaceRows(admin, "services", orgId, (data as { services: unknown[] }).services);
    case "pricing":
      return replaceRows(admin, "service_pricing", orgId, (data as { pricing: unknown[] }).pricing);
    case "team":
      return replaceRows(
        admin,
        "technicians",
        orgId,
        (data as { technicians: unknown[] }).technicians
      );
    case "emergency":
      return replaceRows(
        admin,
        "emergency_rules",
        orgId,
        (data as { emergency_rules: unknown[] }).emergency_rules
      );
    case "hours": {
      const body = data as { hours: Array<Record<string, unknown>>; closed_dates: string[] };
      for (const h of body.hours) {
        const { error } = await admin
          .from("business_hours")
          .upsert(
            {
              org_id: orgId,
              day_of_week: h.day_of_week,
              open_time: h.open_time ?? null,
              close_time: h.close_time ?? null,
              closed_dates: body.closed_dates ?? []
            },
            { onConflict: "org_id,day_of_week" }
          );
        if (error) return false;
      }
      return true;
    }
    default:
      return false;
  }
}

async function replaceRows(
  admin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  table: string,
  orgId: string,
  rows: unknown[]
): Promise<boolean> {
  const del = await admin.from(table).delete().eq("org_id", orgId);
  if (del.error) return false;
  const withOrg = rows.map((r) => ({ ...(r as Record<string, unknown>), org_id: orgId }));
  if (withOrg.length === 0) return true;
  const ins = await admin.from(table).insert(withOrg);
  return !ins.error;
}

export type { NotificationKind };
