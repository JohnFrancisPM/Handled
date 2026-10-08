import { getContext } from "@/lib/data/context";
import { markNotificationRead } from "@/lib/data/mutations";
import { NotificationPatchSchema } from "@/lib/schemas";
import { ok, fail } from "@/lib/api/envelope";

// PATCH /api/notifications/[id] — mark read. Org-scoped service-role write.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctxParam: { params: { id: string } }) {
  const ctx = await getContext();
  if (!ctx) return fail("unauthorized");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("validation", "Request body must be valid JSON.");
  }

  const parsed = NotificationPatchSchema.safeParse(body);
  if (!parsed.success) {
    return fail("validation", parsed.error.issues[0]?.message);
  }

  try {
    const done = await markNotificationRead(ctx, ctxParam.params.id);
    if (!done) return fail("server", "Could not update the notification.");
    return ok({ ok: true });
  } catch {
    return fail("server");
  }
}
