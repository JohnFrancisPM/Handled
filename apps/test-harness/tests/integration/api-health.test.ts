import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/health/route";

const KEYS = ["N8N_WEBHOOK_URL", "N8N_WEBHOOK_SECRET", "OFFLINE_MOCK"];
let saved: Record<string, string | undefined>;
beforeEach(() => {
  saved = {};
  for (const k of KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});
afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("/api/health", () => {
  it("returns booleans only and never leaks the URL or secret", async () => {
    process.env.N8N_WEBHOOK_URL = "https://secret-host/webhook";
    process.env.N8N_WEBHOOK_SECRET = "supersecretvalue";
    process.env.OFFLINE_MOCK = "true";
    const res = await GET();
    const env = await res.json();
    expect(env.ok).toBe(true);
    expect(env.data).toEqual({ webhookConfigured: true, offlineMock: true });
    const serialized = JSON.stringify(env);
    expect(serialized).not.toContain("supersecretvalue");
    expect(serialized).not.toContain("secret-host");
  });

  it("reports webhookConfigured:false when the secret is absent", async () => {
    process.env.N8N_WEBHOOK_URL = "https://x/webhook";
    const env = await (await GET()).json();
    expect(env.data.webhookConfigured).toBe(false);
    expect(env.data.offlineMock).toBe(false);
  });
});
