# Webhook Proxy — client, validation, routes

**Source:** engineering-doc §6, §8, §9 · fixed contract:
`docs/customer-app/implementation/n8n-webhook-contract.md`.
**Role:** a thin server-side proxy to the single n8n webhook. Jobs: (a) keep the secret off
the client, (b) translate harness requests into the fixed contract body, (c) classify the
response by its **body `ok` field** (not HTTP status), (d) enforce graceful degradation.

---

## 1. Contract recap (what we call) — the FIXED endpoint

- `POST {N8N_WEBHOOK_URL}` · header `X-Handled-Secret: {N8N_WEBHOOK_SECRET}` ·
  `Content-Type: application/json`.
- **Request body** (we send): `business_id` (required), `from_phone` (required),
  `text` (required 1–2000), `channel:"sms"`, `customer_name` (optional), `message_id`
  (optional idempotency key). We **never** send `media_url` (out of scope).
- **Response body** (we receive, HTTP 200 in all observed cases):
  `{ ok, reply, intent, agent, actions[], conversation_id, message_id, billed, eval{...} }`
  on success; `{ ok:false, error }` on auth/validation/business failure.

### 1.1 ⚠ The webhook ALWAYS returns HTTP 200 (verified 2026-10-08)

Even auth/validation/business failures come back as **HTTP 200** with
`{"ok":false,"error":"unauthorized"|"validation"|"unknown_business"}` (a wrong/missing
secret returns 200 + `unauthorized` in ~2 s, short-circuiting before the agent). The
contract's nominal 400/401/404 statuses are **not** what the wire returns. **Therefore the
proxy classifies on `body.ok` and `body.error`, never on `response.status`.** (If a future
n8n deployment ever does send a non-2xx, treat it the same as `ok:false` with
`error:"webhook_unavailable"` — §4.3.)

---

## 2. Typed envelope — `lib/api/envelope.ts`

Mirrors `apps/customer-app/lib/api/envelope.ts` in **shape** (`{ok:true,data} | {ok:false,error}`
where `error` is `{code, message}`), with a harness-specific code set. The engineering doc's
inline shorthand `error:"webhook_unavailable"` refers to this `error.code` — the serialized
shape is the object form for monorepo consistency.

```ts
// lib/types.ts
export type ApiErrorCode =
  | "validation"          // bad client input to OUR route (text length, unknown customer)
  | "not_found"           // unknown customerId / scenarioSetId
  | "unauthorized"        // webhook rejected our secret (body ok:false, error "unauthorized")
  | "unknown_business"    // webhook could not resolve business_id
  | "webhook_unavailable" // unreachable / timeout / non-2xx / malformed body / generic webhook ok:false
  | "server";             // truly unexpected internal fault

export interface ApiError { code: ApiErrorCode; message: string; }
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };
```

```ts
// lib/api/envelope.ts
import { NextResponse } from "next/server";
import type { ApiError, ApiErrorCode, ApiResult } from "@/lib/types";

// HTTP status we return to OUR browser. Soft failures use 200 so the client fetch
// never throws; only unexpected faults and bad client input use real error codes.
const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  validation: 422,
  not_found: 200,            // soft: rendered as an in-thread error, not a crash
  unauthorized: 200,         // soft: surfaced, webhook misconfig feedback
  unknown_business: 200,     // soft
  webhook_unavailable: 200,  // soft
  server: 500
};

const DEFAULT_MESSAGE: Record<ApiErrorCode, string> = {
  validation: "The message is invalid.",
  not_found: "That customer could not be found.",
  unauthorized: "Acme's assistant rejected the request — check N8N_WEBHOOK_SECRET.",
  unknown_business: "Acme's assistant could not resolve the business — check ACME_BUSINESS_ID.",
  webhook_unavailable: "Acme's assistant is unavailable — check N8N_WEBHOOK_URL.",
  server: "Something went wrong. Please try again."
};

export function ok<T>(data: T, init?: ResponseInit) {
  const body: ApiResult<T> = { ok: true, data };
  return NextResponse.json(body, init);
}
export function fail(code: ApiErrorCode, message?: string) {
  const error: ApiError = { code, message: message ?? DEFAULT_MESSAGE[code] };
  const body: ApiResult<never> = { ok: false, error };
  return NextResponse.json(body, { status: STATUS_BY_CODE[code] });
}
```

> Design: **OUR** routes return HTTP 200 for every "expected" failure (webhook down, bad
> secret, unknown customer) so the browser's `fetch` never rejects; the client branches on
> `body.ok`. Only `validation` (bad input to us) → 422 and `server` → 500. This mirrors the
> customer-app's "errors never crash the client" posture.

---

## 3. Validation schemas — `lib/validation/contract.ts`

```ts
import { z } from "zod";

// --- client → OUR routes ---
export const sendRequestSchema = z.object({
  customerId: z.string().min(1),
  text: z.string().trim().min(1).max(2000)   // matches contract text 1–2000
});
export const batchRequestSchema = z.object({
  scenarioSetId: z.string().optional()       // "default" => full committed set
});

// --- OUR server → webhook body (built, not received) ---
export const webhookRequestSchema = z.object({
  business_id: z.string().min(1),
  from_phone: z.string().regex(/^\+?[0-9]{7,15}$/),   // contract rule
  text: z.string().min(1).max(2000),
  channel: z.literal("sms"),
  customer_name: z.string().optional(),               // omitted when null
  message_id: z.string()
});

// --- webhook → OUR server (response we must not trust until validated) ---
export const webhookReplySchema = z.object({
  ok: z.boolean(),
  reply: z.string().nullable().optional(),            // null allowed (spam)
  intent: z.string().nullable().optional(),
  agent: z.string().nullable().optional(),
  actions: z.array(z.object({ type: z.string() }).passthrough()).nullable().optional(),
  conversation_id: z.string().nullable().optional(),
  message_id: z.string().nullable().optional(),
  billed: z.boolean().optional(),
  // eval block exists on success; harness UI ignores it but we keep it typed/optional
  eval: z.object({
    question: z.string().optional(),
    response: z.string().optional(),
    citation: z.string().optional(),
    reasoning: z.string().optional()
  }).partial().nullable().optional(),
  error: z.string().nullable().optional()             // present when ok:false
});
export type WebhookReply = z.infer<typeof webhookReplySchema>;
```

The data we hand the UI after a send/batch turn:

```ts
// lib/types.ts (append)
export interface TurnResult {
  reply: string | null;
  intent: string | null;
  agent: string | null;
  actions: Array<{ type: string; [k: string]: unknown }> | null;
  mocked: boolean;      // true when produced by offline-mock
}
```

---

## 4. The core client — `lib/webhook/callWebhook.ts`

Single choke point for every outbound call. Returns a discriminated result the routes map to
the envelope. **Branches on `body.ok`, never on HTTP status.**

```ts
type CallOutcome =
  | { kind: "ok"; result: TurnResult }
  | { kind: "error"; code: ApiErrorCode }   // unauthorized | unknown_business | webhook_unavailable
  | { kind: "unreachable" };                // network/timeout/malformed — eligible for mock
```

### 4.1 Algorithm

```
1. If !hasWebhookConfig():            // no URL or no secret
     return { kind: "unreachable" }   // (routes then apply mock-or-error, §4.4)
2. Build the contract body; validate with webhookRequestSchema. (Bad build => throw => 500.)
3. fetch(getWebhookUrl(), { method:"POST", headers:{ "Content-Type":"application/json",
     "X-Handled-Secret": getWebhookSecret() }, body: JSON.stringify(payload),
     signal: AbortSignal.timeout(getWebhookTimeoutMs()) })   // default 60s
   wrapped in try/catch.
     - On fetch throw (network error, DNS, AbortError/timeout) => return { kind:"unreachable" }.
4. Parse JSON (try/catch). On parse failure => { kind:"unreachable" }.
   (Optional: if response.status is non-2xx AND body unparSeable, treat as unreachable.)
5. Validate the parsed body with webhookReplySchema.
     - On validation failure => { kind:"unreachable" }  (malformed = treat as down).
6. Classify on body.ok:
     - body.ok === true  => { kind:"ok", result: toTurnResult(body, mocked:false) }
     - body.ok === false => map body.error:
         "unauthorized"      => { kind:"error", code:"unauthorized" }
         "unknown_business"  => { kind:"error", code:"unknown_business" }
         "validation"        => { kind:"error", code:"validation" }  // the webhook's own input gripe
         anything else/null  => { kind:"error", code:"webhook_unavailable" }
```

`toTurnResult` copies `reply/intent/agent/actions` (coercing `undefined`→`null`) and sets
`mocked`.

### 4.2 Three client states the UI must distinguish (coordinator mandate)

| Outcome | Envelope the route returns | UI treatment (`chat-ui.md`) |
|---|---|---|
| (a) **Success** `ok:true` | `ok({ reply, intent, agent, actions, mocked:false })` | inbound AI bubble + intent·agent chip + actions. **Even a degraded 200** (`reply:"Agent stopped due to max iterations"`, `actions:[]`) renders here verbatim — do NOT hide it. |
| (b) **Webhook `ok:false`** (unauthorized / unknown_business / validation / other) | `fail(code)` (HTTP 200 soft) | **Error bubble / banner**, NOT a chat reply. Surfaces the misconfig (e.g. "check N8N_WEBHOOK_SECRET"). |
| (c) **Unreachable** (network / timeout / malformed / unconfigured) | mock reply if `OFFLINE_MOCK` else `fail("webhook_unavailable")` | **Offline-mock bubble (tagged)** or non-blocking error bubble. See `graceful-degradation.md`. |

State (a)-degraded and state (c) are deliberately **different**: a degraded-but-200 reply is a
real agent response the tester must see; (c) means we never reached a working agent.

### 4.3 Timeout

`AbortSignal.timeout(getWebhookTimeoutMs())`, default **60 000 ms** (live latency 19–49 s).
A timeout is caught in step 3 → `unreachable`. The composer/batch show a long-running loading
state (`chat-ui.md` §UX states) — a 20–50 s wait is expected, not an error.

### 4.4 Never leak

On any failure, the route returns only `{code, message}` from `DEFAULT_MESSAGE`. The raw
fetch error, URL, secret, and stack are never serialized. No `console.log` of the secret or
full request headers.

---

## 5. `POST /api/send`

```ts
// app/api/send/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
```

Flow:
```
1. Parse JSON body; sendRequestSchema.safeParse. Invalid => fail("validation").       // 422
2. customer = getCustomerById(customerId). Missing => fail("not_found").               // 200 soft
3. Build contract body:
     business_id   = getBusinessId()
     from_phone    = customer.phone
     text          = parsed.text
     channel       = "sms"
     customer_name = customer.name ?? omit            // #23 null => omit the key
     message_id    = `send-${crypto.randomUUID()}`
4. outcome = await sendTurn(customer, text)   // wraps callWebhook; see lib/webhook/send.ts
5. Map outcome → envelope:
     ok          => ok(outcome.result)
     error       => fail(outcome.code)
     unreachable => isOfflineMock() ? ok(mockReplyFor(customer, text)) : fail("webhook_unavailable")
```

`lib/webhook/send.ts` `sendTurn(customer, text)` builds the body and calls `callWebhook`;
it exists so the logic is unit-testable without the route. `mockReplyFor` is specified in
`graceful-degradation.md` §2.

**Success response:**
```jsonc
{ "ok": true, "data": {
    "reply": "I can help... Wed 9am or Thu 1pm?", "intent": "book",
    "agent": "new_booking",
    "actions": [ { "type": "check_availability", "slots": 2 } ],
    "mocked": false } }
```

**Error responses:** per the envelope table in §2 (all soft/200 except `validation` 422 and
`server` 500).

---

## 6. `POST /api/batch`

```ts
// app/api/batch/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
```

Fans the committed scenario set out to the webhook and returns per-scenario results.

### 6.1 Per-scenario contract body
```
business_id   = getBusinessId()
from_phone    = getCustomerById(scenario.customer_id).phone
text          = scenario.text
channel       = "sms"
customer_name = that customer's name ?? omit
message_id    = `batch-${runId}-${scenario.scenario_id}`   // distinct per scenario (dedupe-safe)
```
`runId = crypto.randomUUID()` generated once per batch request.

### 6.2 Concurrency + same-phone serialization (algorithm)
```
scenarios = getScenarios()                       // 55
groups    = groupBy(scenarios, s => customerId→from_phone)   // Map<phone, Scenario[]>
                                                 // order within a group = fixture order
concurrency = getBatchConcurrency()              // default 5, HARD-CAPPED at 5 (env-and-config.md)
                                                 // ⇒ at most 5 webhook requests in flight at any time

run each GROUP as a unit; at most `concurrency` groups in flight at once:
  for each scenario in the group, IN ORDER (serial):
     start = now()
     outcome = await callWebhook(body(scenario))
     latency_ms = now() - start
     push BatchResult(scenario, outcome, latency_ms)
  // next scenario on the SAME phone only starts after the previous completes
     => n8n per-(org,phone) context never interleaves (scenario-set.md §5)

Different phones run concurrently (bounded) => breadth without context bleed.
```
A simple bounded worker pool over the **group list** satisfies this: each worker pulls the
next group and processes its scenarios sequentially. Partial failures never abort the batch —
a failed scenario yields a row with an `error` and the run continues.

### 6.3 Result shape
```ts
// lib/types.ts (append)
export interface BatchResult {
  scenario_id: string;
  text: string;
  expected_intent: string;
  intent: string | null;
  agent: string | null;
  match: boolean;              // returned intent ∈ acceptable_intents (or acceptable = ["*"])
  latency_ms: number;
  reply: string | null;
  actions: Array<{ type: string; [k: string]: unknown }> | null;
  mocked: boolean;
  error: ApiErrorCode | null;  // null on success; set on (b)/(c) outcomes
}
export interface BatchSummary { sent: number; ok: number; matched: number; errored: number; }
```

`match` = `scenario.acceptable_intents.includes("*") || (intent != null &&
scenario.acceptable_intents.includes(intent))`. For `error`/unreachable rows, `match=false`
and `intent=null` (unless mock supplied one).

### 6.4 Response
```jsonc
{ "ok": true, "data": {
    "runId": "…",
    "summary": { "sent": 55, "ok": 53, "matched": 48, "errored": 2 },
    "results": [ { "scenario_id": "H-01", "expected_intent":"book", "intent":"book",
                   "agent":"new_booking", "match":true, "latency_ms":21840,
                   "reply":"…", "actions":[…], "mocked":false, "error":null }, … ] } }
```

- `ok` counter = outcomes where `kind==="ok"` (includes degraded 200s and, if enabled, mocks).
- `errored` = rows with a non-null `error`.
- **Whole-batch hard failure only** when the webhook is unconfigured AND `OFFLINE_MOCK` is
  off: return `fail("webhook_unavailable")` once (the UI shows a banner instead of a grid).
  Otherwise the envelope stays `ok:true` and individual rows carry their own `error`.

### 6.5 Streaming (optional, Phase 2)
MVP may return the whole array once. If/when progressive fill is added, stream newline-
delimited JSON result objects followed by a final summary line; the grid fills live. The MVP
UI shows a progress bar driven by `sent/total` once the response resolves. Either way the
shape in §6.4 is the contract.

---

## 7. Request mapping table (harness → contract) — authoritative

| Contract field | Source | Notes |
|---|---|---|
| `business_id` | `getBusinessId()` (env `ACME_BUSINESS_ID`) | never hardcoded in fixtures |
| `from_phone` | fixture customer `phone` | unique per customer (decision #3) |
| `text` | operator input / scenario `text` | 1–2000, validated |
| `channel` | `"sms"` constant | looks like texting Acme |
| `customer_name` | fixture `name` if present | **omit** when null (#23) |
| `message_id` | `send-<uuid>` / `batch-<runId>-<scenario_id>` | idempotency; distinct per scenario |
| `media_url` | **not sent** | out of scope (no image understanding) |

---

## Requirement coverage
- **TH-3** (send → webhook → render reply + intent/agent/actions) — §5, §4.2(a).
- **TH-4** (one-button batch) — §6.
- **TH-8 / TH-19** (contract fields exact; unique from_phone; business_id from env; no DB
  write-back; no polling — reply only from response body) — §1, §7; no persistence anywhere.
- **TH-12 / TH-16** (secret server-side; a few prompts flow) — §4.4, §5.
- **TH-20** (intent/agent/actions vocabulary) — §3, §6.3.
- Coordinator mandate (200-always, body-`ok` classification, 3 distinct client states) —
  §1.1, §4.1, §4.2.
