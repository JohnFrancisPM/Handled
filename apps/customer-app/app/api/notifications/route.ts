import { getContext } from "@/lib/data/context";
import { getNotifications } from "@/lib/data/dashboard";
import { ok, fail } from "@/lib/api/envelope";

// GET /api/notifications — owner/tech alerts. Org-scoped; demo-safe.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await getContext();
  if (!ctx) return fail("unauthorized");
  const readParam = new URL(req.url).searchParams.get("read");
  const read = readParam === null ? undefined : readParam === "true";
  try {
    const data = await getNotifications(ctx, { read });
    return ok(data);
  } catch {
    return fail("server");
  }
}
