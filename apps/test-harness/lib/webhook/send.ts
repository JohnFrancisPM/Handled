import { getBusinessId } from "@/lib/env";
import { callWebhook, type CallOutcome, type WebhookRequestBody } from "@/lib/webhook/callWebhook";

/** The minimum identity a turn needs — a seeded customer OR an ad-hoc new one. */
export interface SendIdentity {
  phone: string;
  name: string | null;
}

/**
 * Build the fixed-contract body for one impersonated turn and call the webhook.
 * Kept separate from the route so the logic is unit-testable without Next.
 * customer_name is OMITTED when null (#23) per the contract mapping table.
 */
export async function sendTurn(identity: SendIdentity, text: string, messageId?: string): Promise<CallOutcome> {
  const body: WebhookRequestBody = {
    business_id: getBusinessId(),
    from_phone: identity.phone,
    text,
    channel: "sms",
    ...(identity.name ? { customer_name: identity.name } : {}),
    message_id: messageId ?? `send-${crypto.randomUUID()}`
  };
  return callWebhook(body);
}
