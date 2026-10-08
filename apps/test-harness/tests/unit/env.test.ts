import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as env from "@/lib/env";

const KEYS = [
  "N8N_WEBHOOK_URL",
  "N8N_WEBHOOK_SECRET",
  "ACME_BUSINESS_ID",
  "OFFLINE_MOCK",
  "WEBHOOK_TIMEOUT_MS",
  "BATCH_CONCURRENCY"
];
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

describe("env", () => {
  it("hasWebhookConfig is true only when URL and secret are both set", () => {
    expect(env.hasWebhookConfig()).toBe(false);
    process.env.N8N_WEBHOOK_URL = "https://x/webhook";
    expect(env.hasWebhookConfig()).toBe(false);
    process.env.N8N_WEBHOOK_SECRET = "s";
    expect(env.hasWebhookConfig()).toBe(true);
  });

  it("timeout defaults to 60000 and parses overrides, ignoring junk", () => {
    expect(env.getWebhookTimeoutMs()).toBe(60000);
    process.env.WEBHOOK_TIMEOUT_MS = "1000";
    expect(env.getWebhookTimeoutMs()).toBe(1000);
    process.env.WEBHOOK_TIMEOUT_MS = "abc";
    expect(env.getWebhookTimeoutMs()).toBe(60000);
  });

  it("concurrency defaults to 5 and is HARD-CAPPED at 5", () => {
    expect(env.getBatchConcurrency()).toBe(5);
    process.env.BATCH_CONCURRENCY = "3";
    expect(env.getBatchConcurrency()).toBe(3);
    process.env.BATCH_CONCURRENCY = "50";
    expect(env.getBatchConcurrency()).toBe(5);
    process.env.BATCH_CONCURRENCY = "0";
    expect(env.getBatchConcurrency()).toBe(5);
  });

  it("getBusinessId falls back to acme-plumbing", () => {
    expect(env.getBusinessId()).toBe("acme-plumbing");
    process.env.ACME_BUSINESS_ID = "other-biz";
    expect(env.getBusinessId()).toBe("other-biz");
  });

  it("isOfflineMock is case-insensitive", () => {
    expect(env.isOfflineMock()).toBe(false);
    process.env.OFFLINE_MOCK = "TRUE";
    expect(env.isOfflineMock()).toBe(true);
    process.env.OFFLINE_MOCK = "True";
    expect(env.isOfflineMock()).toBe(true);
    process.env.OFFLINE_MOCK = "false";
    expect(env.isOfflineMock()).toBe(false);
  });
});
