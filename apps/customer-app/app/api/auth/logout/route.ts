import { getSupabaseServer } from "@/lib/supabase/server";
import { ok } from "@/lib/api/envelope";

// POST /api/auth/logout — end the Supabase session server-side (the SSR client
// clears the auth cookies). Excluded from middleware (the matcher skips
// `api/auth`) so an expired or partial session can still reach it. In demo mode
// there is no session, so this is a graceful no-op.
// See docs/customer-app/security/security-plan.md §4.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = getSupabaseServer(); // null in demo mode
  if (supabase) {
    await supabase.auth.signOut();
  }
  return ok({ ok: true });
}
