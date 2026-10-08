import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { callWebhook, type WebhookRequestBody } from "@/lib/webhook/callWebhook";

const body: WebhookRequestBody = {
  business_id: "acme-plumbing",
  from_phone: "+15551230001",
  text: "hi",
  channel: "sms",
  message_id: "m1"
};

const jsonRes = (obj: unknown) => ({ json: async () => obj }) as unknown as Response;
const stubFetch = (impl: () => Promise<Response>) => {
  global.fetch = vi.fn(impl) as unknown as typeof fetch;
};

beforeEach(() => {
  process.env.N8N_WEBHOOK_URL = "https://x/webhook";
  process.env.N8N_WEBHOOK_SECRET = "the-secret-value";
});
afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.N8N_WEBHOOK_URL;
  delete process.env.N8N_WEBHOOK_SECRET;
});

describe("callWebhook", () => {
  it("ok:true maps reply/intent/agent/actions, mocked false", async () => {
    stubFetch(async () =>
      jsonRes({ ok: true, reply: "hello", intent: "book", agent: "new_booking", actions: [{ type: "check_availability", slots: 2 }] })
    );
    const r = await callWebhook(body);
    expect(r.kind).toBe("ok");
    if (r.kind === "ok") {
      expect(r.result.reply).toBe("hello");
      expect(r.result.intent).toBe("book");
      expect(r.result.agent).toBe("new_booking");
      expect(r.result.actions?.[0]?.type).toBe("check_availability");
      expect(r.result.mocked).toBe(false);
    }
  });

  it("degraded 200 (max iterations, empty actions) is still kind:ok — not hidden", async () => {
    stubFetch(async () =>
      jsonRes({ ok: true, reply: "Agent stopped due to max iterations.", intent: "book", agent: "new_booking", actions: [] })
    );
    const r = await callWebhook(body);
    expect(r.kind).toBe("ok");
    if (r.kind === "ok") expect(r.result.reply).toContain("max iterations");
  });

  it("classifies on body.ok, never HTTP status: ok:false unauthorized → error unauthorized", async () => {
    stubFetch(async () => jsonRes({ ok: false, error: "unauthorized" }));
    expect(await callWebhook(body)).toEqual({ kind: "error", code: "unauthorized" });
  });

  it("maps unknown_business and validation errors", async () => {
    stubFetch(async () => jsonRes({ ok: false, error: "unknown_business" }));
    expect(await callWebhook(body)).toEqual({ kind: "error", code: "unknown_business" });
    stubFetch(async () => jsonRes({ ok: false, error: "validation" }));
    expect(await callWebhook(body)).toEqual({ kind: "error", code: "validation" });
  });

  it("maps an unrecognized ok:false error to webhook_unavailable", async () => {
    stubFetch(async () => jsonRes({ ok: false, error: "something-weird" }));
    expect(await callWebhook(body)).toEqual({ kind: "error", code: "webhook_unavailable" });
  });

  it("network throw / malformed JSON / schema-invalid body → unreachable", async () => {
    stubFetch(async () => {
      throw new Error("network");
    });
    expect(await callWebhook(body)).toEqual({ kind: "unreachable" });

    stubFetch(async () => ({ json: async () => { throw new Error("bad json"); } }) as unknown as Response);
    expect(await callWebhook(body)).toEqual({ kind: "unreachable" });

    stubFetch(async () => jsonRes({ not: "a valid reply" }));
    expect(await callWebhook(body)).toEqual({ kind: "unreachable" });
  });

  it("returns unreachable when unconfigured (no fetch attempted)", async () => {
    delete process.env.N8N_WEBHOOK_URL;
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;
    expect(await callWebhook(body)).toEqual({ kind: "unreachable" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("never leaks the secret into the returned object", async () => {
    stubFetch(async () => jsonRes({ ok: true, reply: "x" }));
    const r = await callWebhook(body);
    expect(JSON.stringify(r)).not.toContain("the-secret-value");
  });
});
