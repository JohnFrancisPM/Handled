import { getContext } from "@/lib/data/context";
import { getProfileBundle } from "@/lib/data/dashboard";
import { ok, fail } from "@/lib/api/envelope";

// GET /api/profile — load all policy config (dashboard-api.md). Org-scoped; demo-safe.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getContext();
  if (!ctx) return fail("unauthorized");
  try {
    const data = await getProfileBundle(ctx);
    return ok(data);
  } catch {
    return fail("server");
  }
}
