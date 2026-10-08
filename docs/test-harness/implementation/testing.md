# Testing Strategy

**Source:** engineering-doc §13 · conventions match `apps/website` and `apps/customer-app`
(`npm run test` = Vitest, `npm run test:e2e` = Playwright, `npm run typecheck`, `npm run lint`).
E2E runs against a **stubbed webhook** (or OFFLINE_MOCK) so CI needs no live n8n.

---

## 1. Unit (Vitest, jsdom) — `tests/unit/`

| File | Covers |
|---|---|
| `env.test.ts` | `lib/env.ts` — presence/absence branches; `hasWebhookConfig` true only when URL+secret set; default timeout **60000**; default concurrency 5; `getBusinessId` fallback `acme-plumbing`; `isOfflineMock` case-insensitive. |
| `call-webhook.test.ts` | `callWebhook` with **mocked `fetch`**: (a) `ok:true` → `kind:"ok"`, maps reply/intent/agent/actions; **degraded 200** (`"Agent stopped due to max iterations"`, `actions:[]`) still `kind:"ok"` (not hidden); (b) `ok:false` + `error:"unauthorized"`/`"unknown_business"`/`"validation"` → `kind:"error"` with mapped code; (c) **HTTP 200 with `ok:false`** still classifies on body (never status); network throw / AbortError / malformed JSON / schema-invalid → `kind:"unreachable"`; secret never appears in any returned object. |
| `contract-schema.test.ts` | `sendRequestSchema` (text 1–2000, non-empty, trims), `webhookRequestSchema` (from_phone regex), `webhookReplySchema` (reply nullable, actions nullable, eval optional). |
| `mock.test.ts` | `mockReplyFor` → always `mocked:true`, `agent:"offline-mock"`, keyword→intent guess (gas→emergency, price→pricing, book→book, injection→injection). |
| `fixture-load.test.ts` | loaders return 30 customers; `getCustomerById`; `customerLabel` falls back to phone for null-name (#23). |
| `scenarios.test.ts` | `scenarios.json` contains **every `case_id` from `eval-cases.json`** (no case dropped); 5 extras tagged `expected_intent:"*"`; `scenario_count` == array length; every `customer_id` resolves to a fixture customer. |
| `batch-grouping.test.ts` | the group+serialize helper: same-`from_phone` scenarios land in one group and run in fixture order; different phones form separate groups; `match` computed against `acceptable_intents` (incl. `"*"` always-pass). |
| `build-fixture.test.ts` | `scripts/build-harness-fixture.ts` against a **sample seed snippet**: parses `INSERT…VALUES`, decodes escaped quotes (`You''re`→`You're`), null name/address (#23), spam thread (1 user turn, no reply), `tool_calls` jsonb → `actions` with `tool`→`type`, `now()+interval` → `t+Ns`, service_id → name. Idempotent (same input → identical JSON). |

Target ≥90% on `lib/`.

---

## 2. Integration (Vitest) — `tests/integration/`

Route handlers against a **stubbed webhook** (mock `global.fetch`), no network:

| File | Covers |
|---|---|
| `api-send.test.ts` | `/api/send`: success → `ok` envelope with reply/intent/agent/actions; spam (`reply:null`) → `ok` with `reply:null`; unknown customerId → `fail("not_found")` (soft 200); empty text → `fail("validation")` (422); webhook `ok:false unauthorized` → `fail("unauthorized")` (soft 200, message mentions N8N_WEBHOOK_SECRET); unreachable + mock off → `fail("webhook_unavailable")`; unreachable + `OFFLINE_MOCK=true` → `ok` with `mocked:true`; **degraded 200** passes through as success. |
| `api-batch.test.ts` | `/api/batch`: returns summary + per-scenario results; partial failure (one stubbed row errors) does not abort the batch; same-phone scenarios serialized (assert ordering via stub call log); `match` flags; whole-batch `webhook_unavailable` only when unconfigured + mock off. |
| `api-health.test.ts` | `/api/health`: booleans only; never returns URL or secret; reflects env presence. |

---

## 3. E2E (Playwright + axe-core) — `tests/e2e/`

Run with `OFFLINE_MOCK=true` (or a local stub route) so no live n8n is required.

| Spec | Covers |
|---|---|
| `roster.spec.ts` | 30 customers listed; search filters; selecting one opens the thread with backfilled history (user-right/assistant-left); null-name customer shows phone label. |
| `send.spec.ts` | type + Enter → optimistic user bubble + typing indicator → inbound (mock) reply with intent·agent chip + expandable actions; composer re-enables; "Reset thread" clears live turns back to fixture history. |
| `batch.spec.ts` | "Run batch" → progress + results grid fills; summary counters present; a row expands to show reply/actions. |
| `offline.spec.ts` | with webhook disabled: OfflineBanner shows; a send never crashes (mock bubble or error bubble); no unhandled page error. |
| `a11y.spec.ts` | axe-core on the main screen → zero WCAG 2.1 AA violations; keyboard: Tab to roster, Enter selects, Tab to composer, Enter sends. |

---

## 4. Stage-6 live verification (explicit prerequisite)

The webhook is **now confirmed LIVE** (verified 2026-10-08): reachable, `X-Handled-Secret`
enforced, full contract envelope returned, latency ~19–49 s. So Stage-6 manual verification of
SC-2 (live send) and SC-3 (live batch) can run against the real n8n once the harness is
deployed with `N8N_WEBHOOK_URL` + `N8N_WEBHOOK_SECRET` set. Expect long per-call latency —
the 60 s timeout and loading UI are built for it. The customer-app's offline graded eval loop
(`apps/customer-app/tests/eval/`) remains the authoritative scorer; the harness only drives
traffic.

> CI never depends on live n8n — all automated tests stub the webhook.

---

## 5. Coverage matrix (ED §17 requirements → spec + test)

| Req | Spec | Test |
|---|---|---|
| TH-1 impersonate/switch 30 | fixture-extraction, chat-ui | fixture-load, roster.spec |
| TH-2 SMS thread + backfill | fixture-extraction, chat-ui | roster.spec, send.spec |
| TH-3 send→reply+meta | webhook-proxy, chat-ui | api-send, send.spec |
| TH-4/TH-18 batch all evals+more | scenario-set, webhook-proxy | scenarios, api-batch, batch.spec |
| TH-5/SC-4 demo-safety | graceful-degradation | mock, api-send (mock), offline.spec |
| TH-6 no Supabase coupling | project-setup, fixture-extraction | (no @supabase dep); build-with-no-env |
| TH-7 seed→committed fixture | fixture-extraction | build-fixture |
| TH-8/TH-19 contract fields exact | webhook-proxy | call-webhook, contract-schema, api-send |
| TH-9 Next14/TS strict/@ alias | project-setup | typecheck |
| TH-10 design tokens only | design-system-setup | a11y.spec, /design-system review |
| TH-11 own netlify/site | deployment | deploy verification (manual) |
| TH-12 env config/secret server-only | env-and-config, webhook-proxy | env, api-health |
| TH-13 Node 20 | project-setup, deployment | netlify.toml |
| TH-15 Stage-6 n8n prereq | deployment, §4 here | manual |
| TH-16 demo send prompts | chat-ui | send.spec |
| TH-17 SMS look | chat-ui, design-system | roster.spec (bubble alignment) |
| TH-20 intent/agent/actions vocab | webhook-proxy, chat-ui | call-webhook, send.spec |
