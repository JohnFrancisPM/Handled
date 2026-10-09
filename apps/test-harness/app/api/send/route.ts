import { ok, fail } from "@/lib/api/envelope";
import { readJsonCapped } from "@/lib/api/body";
import { isOfflineMock } from "@/lib/env";
import { getCustomerById } from "@/lib/fixtures/load";
import { sendRequestSchema } from "@/lib/validation/contract";
import { sendTurn, type SendIdentity } from "@/lib/webhook/send";
import { mockReplyFor } from "@/lib/webhook/mock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await readJsonCapped(req); // 16 KB cap before any validation
  } catch {
    return fail("validation");
  }

  const parsed = sendRequestSchema.safeParse(json);
  if (!parsed.success) return fail("validation");

  const { customerId, text, fromPhone, customerName } = parsed.data;

  // Ad-hoc "new customer": the client supplies an explicit phone (a number the agent has
  // never seen) — use it directly. Otherwise resolve a seeded customer from the fixture.
  const identity: SendIdentity | null = fromPhone
    ? { phone: fromPhone, name: customerName ?? null }
    : (() => {
        const c = getCustomerById(customerId);
        return c ? { phone: c.phone, name: c.name } : null;
      })();
  if (!identity) return fail("not_found");

  const outcome = await sendTurn(identity, text);
  if (outcome.kind === "ok") return ok(outcome.result);
  if (outcome.kind === "error") return fail(outcome.code);

  // unreachable → mock (if enabled) or a soft error
  return isOfflineMock()
    ? ok(mockReplyFor({ name: identity.name }, text))
    : fail("webhook_unavailable");
}
