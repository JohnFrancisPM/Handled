import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv, isDemoMode, hasServiceRole } from "@/lib/env";

/**
 * SSR Supabase client (anon key + cookie session). Reads the signed-in user's
 * session for org resolution. Returns null in demo mode so handlers fall back
 * to seeded read-only data (build never fails without env).
 *
 * Stage 4 wires the real cookie read/write + session refresh.
 */
export function getSupabaseServer(): SupabaseClient | null {
  if (isDemoMode()) return null;
  const cookieStore = cookies();
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll called from a Server Component — safe to ignore; middleware refreshes.
        }
      }
    }
  });
}

/**
 * Service-role client for privileged writes. Server-only; bypasses RLS, so
 * callers MUST re-check `org_id` from the session (auth-and-middleware.md).
 * Returns null when the key is absent.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!hasServiceRole()) return null;
  return createClient(serverEnv.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export type SessionOrg = { userId: string; orgId: string };

/**
 * Resolve `{ userId, orgId }` from the SSR session by joining `dashboard_users`
 * on `auth.uid()`. Returns null when there is no session / in demo mode —
 * handlers treat null as 401 unless demo (auth-and-middleware.md §Authz rules).
 */
export async function getSessionOrg(): Promise<SessionOrg | null> {
  if (isDemoMode()) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row } = await supabase
    .from("dashboard_users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!row?.org_id) return null;
  return { userId: user.id, orgId: row.org_id as string };
}
