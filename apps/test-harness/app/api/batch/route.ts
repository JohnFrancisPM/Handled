import { ok, fail } from "@/lib/api/envelope";
import { hasWebhookConfig, isOfflineMock } from "@/lib/env";
import { runBatch } from "@/lib/webhook/batch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// NOTE: the MVP returns the whole results array once (webhook-proxy.md §6.5). With live
// latency of 20–50s/turn and 5-at-a-time concurrency, a full 55-scenario run can take
// several minutes — fine for local demo use; production streaming is deferred (Phase 2).
export const maxDuration = 300;

export async function POST() {
  // Whole-batch hard failure only when the webhook is unconfigured AND mock is off.
  if (!hasWebhookConfig() && !isOfflineMock()) return fail("webhook_unavailable");
  const data = await runBatch();
  return ok(data);
}
