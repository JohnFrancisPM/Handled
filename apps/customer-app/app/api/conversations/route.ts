import { getContext } from "@/lib/data/context";
import { getConversations } from "@/lib/data/dashboard";
import { ok, fail } from "@/lib/api/envelope";

// GET /api/conversations — inbox list (realtime-backed). Org-scoped; demo-safe.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await getContext();
  if (!ctx) return fail("unauthorized");
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  try {
    const data = await getConversations(ctx, { status });
    return ok(data);
  } catch {
    return fail("server");
  }
}
