import { getContext } from "@/lib/data/context";
import { getLeads } from "@/lib/data/dashboard";
import { ok, fail } from "@/lib/api/envelope";

// GET /api/leads — follow-up queue. Org-scoped; demo-safe.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await getContext();
  if (!ctx) return fail("unauthorized");
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  try {
    const data = await getLeads(ctx, { status });
    return ok(data);
  } catch {
    return fail("server");
  }
}
