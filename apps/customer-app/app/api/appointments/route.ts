import { getContext } from "@/lib/data/context";
import { getAppointments } from "@/lib/data/dashboard";
import { ok, fail } from "@/lib/api/envelope";

// GET /api/appointments — jobs list. Org-scoped; demo-safe.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await getContext();
  if (!ctx) return fail("unauthorized");
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  try {
    const data = await getAppointments(ctx, { status });
    return ok(data);
  } catch {
    return fail("server");
  }
}
