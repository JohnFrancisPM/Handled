import { ok } from "@/lib/api/envelope";
import { hasWebhookConfig, isOfflineMock } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return ok({ webhookConfigured: hasWebhookConfig(), offlineMock: isOfflineMock() });
}
