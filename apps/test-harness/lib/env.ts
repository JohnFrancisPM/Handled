/**
 * Central, typed env access for the test harness. ALL process.env reads live here.
 * Every value below is SERVER-ONLY. Do not import this module into a Client Component.
 */

const DEFAULT_TIMEOUT_MS = 60_000; // live webhook latency is 19–49s (verified 2026-10-08)
const DEFAULT_CONCURRENCY = 5;
const MAX_CONCURRENCY = 5; // hard cap: never more than 5 requests in flight (product decision)
const DEFAULT_BUSINESS_ID = "acme-plumbing";

export function getWebhookUrl(): string {
  return process.env.N8N_WEBHOOK_URL ?? "";
}

export function getWebhookSecret(): string {
  return process.env.N8N_WEBHOOK_SECRET ?? "";
}

export function getBusinessId(): string {
  return process.env.ACME_BUSINESS_ID || DEFAULT_BUSINESS_ID;
}

export function isOfflineMock(): boolean {
  return (process.env.OFFLINE_MOCK ?? "").toLowerCase() === "true";
}

/** True only when BOTH the URL and the secret are present. */
export function hasWebhookConfig(): boolean {
  return Boolean(getWebhookUrl() && getWebhookSecret());
}

export function getWebhookTimeoutMs(): number {
  const n = Number(process.env.WEBHOOK_TIMEOUT_MS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TIMEOUT_MS;
}

export function getBatchConcurrency(): number {
  const n = Number(process.env.BATCH_CONCURRENCY);
  const requested = Number.isInteger(n) && n > 0 ? n : DEFAULT_CONCURRENCY;
  return Math.min(requested, MAX_CONCURRENCY); // hard cap at 5 — at most 5 webhook requests at a time
}
