import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST } from "@/app/api/send/route";
import { getCustomers } from "@/lib/fixtures/load";

const CID = getCustomers()[0]!.id;
const jsonRes = (obj: unknown) => ({ json: async () => obj }) as unknown as Response;
const req = (bodyObj: unknown) =>
  new Request("http://localhost/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyObj)
  });

beforeEach(() => {
  process.env.N8N_WEBHOOK_URL = "https://x/webhook";
  process.env.N8N_WEBHOOK_SECRET = "s";
  process.env.ACME_BUSINESS_ID = "acme-plumbing";
  delete process.env.OFFLINE_MOCK;
});
afterEach(() => {
  vi.restoreAllMocks();
  for (const k of ["N8N_WEBHOOK_URL", "N8N_WEBHOOK_SECRET", "ACME_BUSINESS_ID", "OFFLINE_MOCK"]) delete process.env[k];
});

describe("/api/send", () => {
  it("success → ok envelope with reply/intent/agent/actions", async () => {
    global.fetch = vi.fn(async () =>
      jsonRes({ ok: true, reply: "hi", intent: "book", agent: "new_booking", actions: [{ type: "check_availability" }] })
    ) as unknown as typeof fetch;
    const res = await POST(req({ customerId: CID, text: "hello" }));
    expect(res.status).toBe(200);
    const env = await res.json();
    expect(env.ok).toBe(true);
    expect(env.data).toMatchObject({ reply: "hi", intent: "book", agent: "new_booking", mocked: false });
  });

  it("spam reply:null → ok with reply null", async () => {
    global.fetch = vi.fn(async () => jsonRes({ ok: true, reply: null, intent: "spam", agent: "guard" })) as unknown as typeof fetch;
    const env = await (await POST(req({ customerId: CID, text: "spam" }))).json();
    expect(env.ok).toBe(true);
    expect(env.data.reply).toBeNull();
  });

  it("unknown customer → not_found (soft 200)", async () => {
    const res = await POST(req({ customerId: "does-not-exist", text: "hi" }));
    expect(res.status).toBe(200);
    const env = await res.json();
    expect(env.ok).toBe(false);
    expect(env.error.code).toBe("not_found");
  });

  it("empty text → validation (422)", async () => {
    const res = await POST(req({ customerId: CID, text: "   " }));
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe("validation");
  });

  it("oversized body (> 16 KB) → validation (422), rejected before Zod", async () => {
    const huge = new Request("http://localhost/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: CID, text: "x".repeat(20_000) })
    });
    const res = await POST(huge);
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe("validation");
  });

  it("webhook ok:false unauthorized → unauthorized (soft 200), message mentions the secret var", async () => {
    global.fetch = vi.fn(async () => jsonRes({ ok: false, error: "unauthorized" })) as unknown as typeof fetch;
    const res = await POST(req({ customerId: CID, text: "hi" }));
    expect(res.status).toBe(200);
    const env = await res.json();
    expect(env.error.code).toBe("unauthorized");
    expect(env.error.message).toMatch(/N8N_WEBHOOK_SECRET/);
  });

  it("unreachable + mock off → webhook_unavailable", async () => {
    global.fetch = vi.fn(async () => {
      throw new Error("network");
    }) as unknown as typeof fetch;
    const env = await (await POST(req({ customerId: CID, text: "hi" }))).json();
    expect(env.ok).toBe(false);
    expect(env.error.code).toBe("webhook_unavailable");
  });

  it("unreachable + OFFLINE_MOCK=true → ok with mocked:true", async () => {
    process.env.OFFLINE_MOCK = "true";
    global.fetch = vi.fn(async () => {
      throw new Error("network");
    }) as unknown as typeof fetch;
    const env = await (await POST(req({ customerId: CID, text: "my pipe burst" }))).json();
    expect(env.ok).toBe(true);
    expect(env.data.mocked).toBe(true);
    expect(env.data.agent).toBe("offline-mock");
  });

  it("ad-hoc new customer (fromPhone, no fixture row) → ok, sends that phone", async () => {
    const seen: { from_phone?: string; customer_name?: string } = {};
    global.fetch = vi.fn(async (_url, init?: RequestInit) => {
      seen.from_phone = JSON.parse(String(init?.body)).from_phone;
      seen.customer_name = JSON.parse(String(init?.body)).customer_name;
      return jsonRes({ ok: true, reply: "Happy to help — when works for you?", intent: "book", agent: "new_booking" });
    }) as unknown as typeof fetch;
    const res = await POST(
      req({ customerId: "new-abc", text: "Hi, I'd like to book a plumber", fromPhone: "+15559990001", customerName: "Dana New" })
    );
    expect(res.status).toBe(200);
    const env = await res.json();
    expect(env.ok).toBe(true);
    expect(env.data.intent).toBe("book");
    expect(seen.from_phone).toBe("+15559990001");
    expect(seen.customer_name).toBe("Dana New");
  });

  it("ad-hoc new customer with no name omits customer_name", async () => {
    const seen: Record<string, unknown> = {};
    global.fetch = vi.fn(async (_url, init?: RequestInit) => {
      Object.assign(seen, JSON.parse(String(init?.body)));
      return jsonRes({ ok: true, reply: "hi", intent: "book", agent: "new_booking" });
    }) as unknown as typeof fetch;
    const env = await (await POST(req({ customerId: "new-xyz", text: "book me", fromPhone: "+15559990002" }))).json();
    expect(env.ok).toBe(true);
    expect("customer_name" in seen).toBe(false);
  });

  it("degraded 200 passes through as success (not hidden)", async () => {
    global.fetch = vi.fn(async () =>
      jsonRes({ ok: true, reply: "Agent stopped due to max iterations.", intent: "book", agent: "new_booking", actions: [] })
    ) as unknown as typeof fetch;
    const env = await (await POST(req({ customerId: CID, text: "book" }))).json();
    expect(env.ok).toBe(true);
    expect(env.data.reply).toContain("max iterations");
  });
});
