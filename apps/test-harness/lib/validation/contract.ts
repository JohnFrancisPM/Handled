import { z } from "zod";

// --- client → OUR routes ---
export const sendRequestSchema = z.object({
  customerId: z.string().min(1),
  text: z.string().trim().min(1).max(2000) // matches contract text 1–2000
});

export const batchRequestSchema = z.object({
  scenarioSetId: z.string().optional() // "default" => full committed set
});

// --- OUR server → webhook body (built, not received) ---
export const webhookRequestSchema = z.object({
  business_id: z.string().min(1),
  from_phone: z.string().regex(/^\+?[0-9]{7,15}$/), // contract rule
  text: z.string().min(1).max(2000),
  channel: z.literal("sms"),
  customer_name: z.string().optional(), // omitted when null
  message_id: z.string()
});

// --- webhook → OUR server (response we must not trust until validated) ---
export const webhookReplySchema = z.object({
  ok: z.boolean(),
  reply: z.string().nullable().optional(), // null allowed (spam)
  intent: z.string().nullable().optional(),
  agent: z.string().nullable().optional(),
  actions: z.array(z.object({ type: z.string() }).passthrough()).nullable().optional(),
  conversation_id: z.string().nullable().optional(),
  message_id: z.string().nullable().optional(),
  billed: z.boolean().optional(),
  eval: z
    .object({
      question: z.string().optional(),
      response: z.string().optional(),
      citation: z.string().optional(),
      reasoning: z.string().optional()
    })
    .partial()
    .nullable()
    .optional(),
  error: z.string().nullable().optional() // present when ok:false
});

export type WebhookReply = z.infer<typeof webhookReplySchema>;
