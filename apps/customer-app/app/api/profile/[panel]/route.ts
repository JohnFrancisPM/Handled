import { getContext } from "@/lib/data/context";
import { savePanel } from "@/lib/data/mutations";
import { PANEL_SCHEMAS, isPanelName } from "@/lib/schemas";
import { ok, fail } from "@/lib/api/envelope";

// PUT /api/profile/[panel] — save a policy panel.
// panel ∈ identity | areas | services | pricing | hours | team | emergency.
// Per-panel Zod validation; service-role write re-checking org_id.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request, ctxParam: { params: { panel: string } }) {
  const ctx = await getContext();
  if (!ctx) return fail("unauthorized");

  const panel = ctxParam.params.panel;
  if (!isPanelName(panel)) return fail("not_found", "Unknown policy panel.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("validation", "Request body must be valid JSON.");
  }

  const parsed = PANEL_SCHEMAS[panel].safeParse(body);
  if (!parsed.success) {
    return fail("validation", parsed.error.issues[0]?.message);
  }

  try {
    const done = await savePanel(ctx, panel, parsed.data);
    if (!done) return fail("server", "Could not save your changes.");
    return ok({ ok: true });
  } catch {
    return fail("server");
  }
}
