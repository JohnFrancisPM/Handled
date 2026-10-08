import { ok, fail } from "@/lib/api/envelope";
import { readJsonCapped } from "@/lib/api/body";
import { isOfflineMock } from "@/lib/env";
import { getCustomerById } from "@/lib/fixtures/load";
import { sendRequestSchema } from "@/lib/validation/contract";
import { sendTurn } from "@/lib/webhook/send";
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

  const customer = getCustomerById(parsed.data.customerId);
  if (!customer) return fail("not_found");

  const outcome = await sendTurn(customer, parsed.data.text);
  if (outcome.kind === "ok") return ok(outcome.result);
  if (outcome.kind === "error") return fail(outcome.code);

  // unreachable → mock (if enabled) or a soft error
  return isOfflineMock()
    ? ok(mockReplyFor(customer, parsed.data.text))
    : fail("webhook_unavailable");
}
