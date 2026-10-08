import { describe, it, expect } from "vitest";
import {
  sendRequestSchema,
  webhookRequestSchema,
  webhookReplySchema
} from "@/lib/validation/contract";

describe("sendRequestSchema", () => {
  it("accepts valid input and trims text", () => {
    const r = sendRequestSchema.safeParse({ customerId: "c1", text: "  hello  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.text).toBe("hello");
  });
  it("rejects empty / whitespace-only / >2000 chars", () => {
    expect(sendRequestSchema.safeParse({ customerId: "c1", text: "" }).success).toBe(false);
    expect(sendRequestSchema.safeParse({ customerId: "c1", text: "   " }).success).toBe(false);
    expect(sendRequestSchema.safeParse({ customerId: "c1", text: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("webhookRequestSchema", () => {
  it("enforces the from_phone regex", () => {
    expect(webhookRequestSchema.safeParse({ business_id: "acme", from_phone: "+15551230001", text: "hi", channel: "sms", message_id: "m" }).success).toBe(true);
    expect(webhookRequestSchema.safeParse({ business_id: "acme", from_phone: "not-a-phone", text: "hi", channel: "sms", message_id: "m" }).success).toBe(false);
  });
});

describe("webhookReplySchema", () => {
  it("allows null reply/actions and optional eval block", () => {
    expect(webhookReplySchema.safeParse({ ok: true, reply: null, actions: null }).success).toBe(true);
    expect(
      webhookReplySchema.safeParse({
        ok: true,
        reply: "x",
        intent: "book",
        actions: [{ type: "create_appointment", price: 180 }],
        eval: { question: "q", response: "r", citation: "c", reasoning: "why" }
      }).success
    ).toBe(true);
  });
  it("requires ok to be a boolean", () => {
    expect(webhookReplySchema.safeParse({ reply: "x" }).success).toBe(false);
  });
});
