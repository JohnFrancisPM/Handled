import { getBusinessId } from "@/lib/env";
import { callWebhook, type CallOutcome, type WebhookRequestBody } from "@/lib/webhook/callWebhook";
import type { Customer } from "@/lib/fixtures/types";

/**
 * Build the fixed-contract body for one impersonated turn and call the webhook.
 * Kept separate from the route so the logic is unit-testable without Next.
 * customer_name is OMITTED when null (#23) per the contract mapping table.
 */
export async function sendTurn(customer: Customer, text: string, messageId?: string): Promise<CallOutcome> {
  const body: WebhookRequestBody = {
    business_id: getBusinessId(),
    from_phone: customer.phone,
    text,
    channel: "sms",
    ...(customer.name ? { customer_name: customer.name } : {}),
    message_id: messageId ?? `send-${crypto.randomUUID()}`
  };
  return callWebhook(body);
}
