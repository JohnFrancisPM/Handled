import { getWebhookSecret, getWebhookTimeoutMs, getWebhookUrl, hasWebhookConfig } from "@/lib/env";
import { webhookReplySchema, type WebhookReply } from "@/lib/validation/contract";
import type { ApiErrorCode, Action, TurnResult } from "@/lib/types";

export interface WebhookRequestBody {
  business_id: string;
  from_phone: string;
  text: string;
  channel: "sms";
  customer_name?: string;
  message_id: string;
}

/** Discriminated outcome the routes map to the typed envelope. Classifies on body.ok. */
export type CallOutcome =
  | { kind: "ok"; result: TurnResult }
  | { kind: "error"; code: Extract<ApiErrorCode, "unauthorized" | "unknown_business" | "validation" | "webhook_unavailable"> }
  | { kind: "unreachable" }; // network/timeout/malformed/unconfigured — eligible for mock

function toTurnResult(body: WebhookReply): TurnResult {
  return {
    reply: body.reply ?? null,
    intent: body.intent ?? null,
    agent: body.agent ?? null,
    actions: (body.actions as Action[] | null | undefined) ?? null,
    mocked: false
  };
}

/**
 * Single choke point for every outbound call to the n8n webhook. The webhook ALWAYS returns
 * HTTP 200 (even on auth/validation failure), so we branch on body.ok, NEVER on HTTP status.
 * Never rethrows a fetch error past its try/catch (graceful-degradation.md §5 invariant).
 */
export async function callWebhook(payload: WebhookRequestBody): Promise<CallOutcome> {
  if (!hasWebhookConfig()) return { kind: "unreachable" };

  let res: Response;
  try {
    res = await fetch(getWebhookUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Handled-Secret": getWebhookSecret()
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(getWebhookTimeoutMs()) // default 60s; 20–50s waits are normal
    });
  } catch {
    // network error, DNS failure, or AbortError (timeout) — treat as unreachable
    return { kind: "unreachable" };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { kind: "unreachable" }; // unparseable body = treat as down
  }

  const parsed = webhookReplySchema.safeParse(json);
  if (!parsed.success) return { kind: "unreachable" }; // malformed = treat as down

  const body = parsed.data;
  if (body.ok === true) return { kind: "ok", result: toTurnResult(body) };

  // body.ok === false → map the webhook's own error signal
  switch (body.error) {
    case "unauthorized":
      return { kind: "error", code: "unauthorized" };
    case "unknown_business":
      return { kind: "error", code: "unknown_business" };
    case "validation":
      return { kind: "error", code: "validation" };
    default:
      return { kind: "error", code: "webhook_unavailable" };
  }
}
