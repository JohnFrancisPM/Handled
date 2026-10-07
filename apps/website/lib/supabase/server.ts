import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only. Returns null when env is absent so the lead handler can gracefully no-op (R22).
// NEVER import this into a Client Component — the service-role key is server-only.
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;                       // graceful-degradation guard (R22)
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
