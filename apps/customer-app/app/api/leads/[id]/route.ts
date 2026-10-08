import { getContext } from "@/lib/data/context";
import { patchLeadStatus } from "@/lib/data/mutations";
import { LeadPatchSchema } from "@/lib/schemas";
import { ok, fail } from "@/lib/api/envelope";

// PATCH /api/leads/[id] — work a lead. Validated, org-scoped, service-role write.
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

  const parsed = LeadPatchSchema.safeParse(body);
  if (!parsed.success) {
    return fail("validation", parsed.error.issues[0]?.message);
  }

  try {
    const done = await patchLeadStatus(ctx, ctxParam.params.id, parsed.data.status);
    if (!done) return fail("server", "Could not update the lead.");
    return ok({ ok: true });
  } catch {
    return fail("server");
  }
}
