---
name: decisions-test-harness
description: Stage-2 implementation-spec decisions for the test-harness app (no-DB SMS tester calling the n8n webhook) + rationale and gotchas
metadata:
  type: project
---

# Test-harness Stage-2 spec decisions

Specs live in `docs/test-harness/implementation/` (11 files: README, project-setup,
env-and-config, fixture-extraction, scenario-set, webhook-proxy, graceful-degradation,
chat-ui, design-system-setup, testing, deployment + `.env.example`). See [[run-history]].

## Load-bearing decisions
- **No `supabase-schema.sql`** — intentional, documented in README. App has NO database
  (locked decision #1/#2). The committed JSON fixture IS the data model
  (`fixture-extraction.md`). Reviewer may flag the skill's "always include SQL" rule; the
  omission is sanctioned by the task + locked architecture.
- **Webhook ALWAYS returns HTTP 200** (verified live 2026-10-08), even for auth/validation
  failures (wrong secret → 200 + `{ok:false,error:"unauthorized"}`, ~2s). So the proxy
  classifies on **`body.ok`**, never HTTP status. Three distinct client states:
  (a) success incl. degraded-200, (b) webhook `ok:false` (surfaced error, not a reply),
  (c) unreachable/timeout/malformed → offline-mock or error. Encoded in `callWebhook`
  `CallOutcome` discriminated union.
- **Latency is 19–49s** (NOT the ED/contract's ~3s). `WEBHOOK_TIMEOUT_MS` default **60000**;
  loading UI tolerant of long waits. Called out as a correction to ED SC-2.
- **Degraded-but-200 ≠ unreachable.** Degraded replies (e.g. booking agent "Agent stopped
  due to max iterations", empty actions) are a REAL agent turn — displayed faithfully, never
  hidden. Offline-mock only fires when truly unreachable AND `OFFLINE_MOCK=true`.
- **Envelope shape** mirrors customer-app (`{ok,data}|{ok:false,error:{code,message}}`) with
  a harness-specific code set (adds `unauthorized`, `unknown_business`, `webhook_unavailable`).
  ED's inline `error:"webhook_unavailable"` shorthand == `error.code`. Soft failures return
  HTTP 200 so the browser fetch never throws; only `validation`→422, `server`→500.
- **Fixture build:** `scripts/build-harness-fixture.ts` (repo-root scripts/, builder-side)
  parses seed 01/04/05/06 with `pgsql-ast-parser`, joins customers→conversation→messages
  (+appointments), maps `tool_calls` jsonb → `actions` renaming `tool`→`type` (matches live
  webhook actions shape), normalizes `now()±interval` → relative labels (`t+Ns`, "N days
  ago"). Output `apps/test-harness/fixtures/customers.json` committed. #23 null name→phone
  label; #24/#25 spam = 1 user turn no reply.
- **Batch:** `scenarios.json` = 50 eval cases (every `case_id` from
  `apps/customer-app/tests/eval/eval-cases.json`) + 5 extras (`expected_intent:"*"`). Lenient
  `acceptable_intents` match = demo aid, NOT authoritative (that's customer-app `score.ts` +
  Azure). **Same-`from_phone` scenarios serialized** within a phone-group (n8n per-(org,phone)
  context mustn't interleave); different phones concurrent up to `BATCH_CONCURRENCY` (groups,
  default 5). Distinct `message_id` per scenario (`batch-<runId>-<scenario_id>`).
- **Secrets server-only:** NO `NEXT_PUBLIC_*` at all (stricter than customer-app). Browser
  calls only `/api/send|batch|health`. CSP `connect-src 'self'`. `/api/health` returns
  booleans only.

## Gotchas for future edits
- Keep `scenarios.json` in sync with `eval-cases.json` (a unit test asserts every case_id
  present). The two non-textual eval inputs (Ha-06 robocall, Ha-08 muffled, H-07 hangup,
  Ha-09 outage, Ha-16 consent) get substituted realistic SMS text — documented in
  scenario-set.md §2.1.
- Service-id→name map (drain=…001 fixture=…002 water_heater=…003 leak=…004 sump=…005
  boiler=…007) comes from seed 01, used for `last_job` chip.
