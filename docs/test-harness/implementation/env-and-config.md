# Env & Config — `lib/env.ts` + `/api/health`

**Source:** engineering-doc §6.1, §12, §16 · **Rule:** every `process.env` read goes through
`lib/env.ts`; Stage-4 code never touches `process.env` directly (same discipline as
`apps/customer-app/lib/env.ts`).

---

## 1. Environment variable catalog

| Var | Scope | Secret? | Default | Purpose |
|---|---|---|---|---|
| `N8N_WEBHOOK_URL` | **server only** | no (but server-only) | — | n8n webhook endpoint, e.g. `https://<host>/webhook/handled/message` |
| `N8N_WEBHOOK_SECRET` | **server only** | **YES** | — | value sent in the `X-Handled-Secret` header. Never `NEXT_PUBLIC_`, never logged, never returned to the browser |
| `ACME_BUSINESS_ID` | **server only** | no | `acme-plumbing` | the contract `business_id` (org slug). Never hardcoded in a fixture |
| `OFFLINE_MOCK` | server | no | `false` | `"true"` → return canned mock replies when the webhook is unreachable/unconfigured (demo-safety) |
| `WEBHOOK_TIMEOUT_MS` | server | no | **`60000`** | per-request AbortController timeout. **Default 60 s** (observed live latency is 19–49 s; the ED's 10 s was based on the stale 3 s assumption — overridden here) |
| `BATCH_CONCURRENCY` | server | no | `5` (**hard max 5**) | max concurrent **phone groups** in flight during a batch ⇒ at most **5 webhook requests at a time**; any value above 5 is clamped to 5 (see `webhook-proxy.md` §6) |

**There are NO `NEXT_PUBLIC_*` variables.** The browser never reads any of the above and
never calls n8n directly; it calls only the harness's own `/api/*` routes. This is the
same server-only posture as the website (and stricter than the customer-app, whose browser
does talk to Supabase — not applicable here).

The app **builds and runs with none of these set**: `/api/health` reports
`webhookConfigured:false`, the UI shows the offline banner, and `/api/send` / `/api/batch`
return either a mock reply (`OFFLINE_MOCK=true`) or a soft `webhook_unavailable` envelope.
See `graceful-degradation.md`.

---

## 2. `lib/env.ts` (exact surface)

```ts
/**
 * Central, typed env access for the test harness. ALL process.env reads live here.
 * Every value below is SERVER-ONLY. Do not import this module into a Client Component.
 */

const DEFAULT_TIMEOUT_MS = 60_000;   // live webhook latency is 19–49s (verified 2026-10-08)
const DEFAULT_CONCURRENCY = 5;
const MAX_CONCURRENCY = 5;            // hard cap: never more than 5 requests in flight (product decision)
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
  return Math.min(requested, MAX_CONCURRENCY);   // hard cap at 5 — at most 5 webhook requests at a time
}
```

Rules:
- `hasWebhookConfig()` gates "can we actually call n8n?" and is the single source for the
  offline banner.
- `getBusinessId()` falls back to `acme-plumbing` so a forgotten env var never breaks the
  demo, but the value is still **env-driven** (TH-12: nothing hardcoded in fixtures/components).
- No function ever returns the secret to a caller that serializes to the client. Only
  `callWebhook` (server) reads `getWebhookSecret()`.

---

## 3. Secret-handling invariants (enforced by review + tests)

1. `N8N_WEBHOOK_SECRET` is referenced **only** inside `lib/webhook/callWebhook.ts`.
   A unit test greps the client bundle / asserts it is never imported by a `"use client"`
   module.
2. `/api/health` returns **booleans only** — never the URL or secret value.
3. Errors returned to the client carry a code + safe message only; the raw fetch error,
   stack, URL, and secret are never serialized into a response (see `webhook-proxy.md` §4).

---

## 4. `GET /api/health`

- **Purpose:** let the browser render the offline banner and the mock-mode indicator
  without exposing any secret value.
- `runtime = "nodejs"`, `dynamic = "force-dynamic"`.
- **Response (always `ok:true`):**

```jsonc
{ "ok": true, "data": { "webhookConfigured": true, "offlineMock": false } }
```

```ts
// app/api/health/route.ts
import { ok } from "@/lib/api/envelope";
import { hasWebhookConfig, isOfflineMock } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return ok({ webhookConfigured: hasWebhookConfig(), offlineMock: isOfflineMock() });
}
```

Consumed by the `useHealth` React Query hook (`chat-ui.md` §State) to drive
`<OfflineBanner />`.

---

## Requirement coverage
- **TH-12** (config via env; secrets server-side only; nothing hardcoded) — §1–§3.
- **TH-5/TH-7** (never hard-fail with env missing) — §1 (build-with-nothing-set), §4.
- Verified-backend latency correction (60 s timeout) — §1, §2.
