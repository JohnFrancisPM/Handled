import { getContext } from "@/lib/data/context";
import { getConversationThread } from "@/lib/data/dashboard";
import { ok, fail } from "@/lib/api/envelope";

// GET /api/conversations/[id] — thread (org-scoped; 404 if not in org).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctxParam: { params: { id: string } }) {
  const ctx = await getContext();
  if (!ctx) return fail("unauthorized");
  try {
    const thread = await getConversationThread(ctx, ctxParam.params.id);
    if (!thread) return fail("not_found");
    return ok(thread);
  } catch {
    return fail("server");
  }
}
