import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NextRequest } from "next/server";

// Mock the two collaborators the route depends on; keep real zod validation.
vi.mock("@/lib/supabase/server", () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn() }));

import { POST } from "@/app/api/leads/route";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const getSupabaseAdminMock = vi.mocked(getSupabaseAdmin);
const rateLimitMock = vi.mocked(rateLimit);

type ReqOpts = {
  headers?: Record<string, string>;
  jsonImpl?: () => unknown; // may throw synchronously to simulate an unexpected failure
};

function makeRequest(body: unknown, opts: ReqOpts = {}): NextRequest {
  const headers = new Headers(opts.headers ?? {});
  return {
    headers,
    json: opts.jsonImpl ?? (async () => body)
  } as unknown as NextRequest;
}

// A Supabase stub whose insert() resolves with the given result. Exposes spies.
function makeSupabaseStub(insertResult: { error: unknown } = { error: null }) {
  const insert = vi.fn().mockResolvedValue(insertResult);
  const from = vi.fn().mockReturnValue({ insert });
  return { client: { from } as never, from, insert };
}

const fullPayload = {
  name: "Jane Tester",
  businessName: "Jane Plumbing",
  email: "jane@example.com",
  phone: "",
  trade: "",
  weeklyCalls: "25",
  planInterest: "pro",
  message: "",
  sourcePath: "/pricing"
};

beforeEach(() => {
  vi.clearAllMocks();
  rateLimitMock.mockReturnValue({ ok: true });
});

describe("POST /api/leads (R22, R24, R32)", () => {
  it("happy path, env present → 200 stored:true with snake_case insert", async () => {
    const { client, from, insert } = makeSupabaseStub();
    getSupabaseAdminMock.mockReturnValue(client);

    const res = await POST(makeRequest(fullPayload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, stored: true });

    expect(from).toHaveBeenCalledWith("leads");
    const inserted = insert.mock.calls[0]?.[0];
    expect(inserted).toMatchObject({
      name: "Jane Tester",
      business_name: "Jane Plumbing",
      email: "jane@example.com",
      weekly_calls: 25,
      plan_interest: "pro",
      source_path: "/pricing"
    });
  });

  it("GUARD: env missing → 200 stored:false with no insert attempted", async () => {
    getSupabaseAdminMock.mockReturnValue(null);

    const res = await POST(makeRequest(fullPayload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, stored: false });
  });

  it("insert returns an error → 200 stored:false, not thrown", async () => {
    const { client, insert } = makeSupabaseStub({ error: { message: "db down" } });
    getSupabaseAdminMock.mockReturnValue(client);

    const res = await POST(makeRequest(fullPayload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, stored: false });
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("validation failure (missing email) → 400 with field error", async () => {
    const { client, insert } = makeSupabaseStub();
    getSupabaseAdminMock.mockReturnValue(client);

    const { email: _omit, ...noEmail } = fullPayload;
    const res = await POST(makeRequest(noEmail));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("validation");
    expect(body.fields.email).toBeDefined();
    expect(insert).not.toHaveBeenCalled();
  });

  it("honeypot tripped → 400 validation, no insert", async () => {
    const { client, insert } = makeSupabaseStub();
    getSupabaseAdminMock.mockReturnValue(client);

    const res = await POST(makeRequest({ ...fullPayload, company: "spam-bot" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("validation");
    expect(insert).not.toHaveBeenCalled();
  });

  it("min-fill-time (submitted instantly) → 400 validation, no insert", async () => {
    const { client, insert } = makeSupabaseStub();
    getSupabaseAdminMock.mockReturnValue(client);

    const res = await POST(makeRequest({ ...fullPayload, formLoadedAt: Date.now() }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("validation");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rate limited → 429 with Retry-After header", async () => {
    rateLimitMock.mockReturnValue({ ok: false, retryAfterSec: 42 });

    const res = await POST(makeRequest(fullPayload));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: "rate_limited" });
    expect(res.headers.get("Retry-After")).toBe("42");
  });

  it("unexpected server error → 500 with no stack trace in the body", async () => {
    const res = await POST(
      makeRequest(fullPayload, {
        jsonImpl: () => {
          throw new Error("kaboom at /secret/path/route.ts:99");
        }
      })
    );
    expect(res.status).toBe(500);
    const raw = await res.text();
    expect(JSON.parse(raw)).toEqual({ ok: false, error: "server" });
    // The response body must not leak error internals / stack traces.
    expect(raw).not.toContain("kaboom");
    expect(raw).not.toContain("stack");
    expect(raw).not.toContain("route.ts");
  });

  it("field mapping: snake_case keys with empty strings normalized to null", async () => {
    const { client, insert } = makeSupabaseStub();
    getSupabaseAdminMock.mockReturnValue(client);

    const res = await POST(
      makeRequest(
        { ...fullPayload, phone: "", trade: "", message: "" },
        { headers: { "user-agent": "vitest-UA" } }
      )
    );
    expect(res.status).toBe(200);

    const inserted = insert.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(inserted).toMatchObject({
      business_name: "Jane Plumbing",
      weekly_calls: 25,
      plan_interest: "pro",
      source_path: "/pricing",
      user_agent: "vitest-UA"
    });
    expect(inserted.phone).toBeNull();
    expect(inserted.trade).toBeNull();
    expect(inserted.message).toBeNull();
  });
});
