---
name: decisions-test-harness
description: Architectural decisions for the test-harness engineering doc (standalone SMS-style tester that drives the n8n webhook)
metadata:
  type: project
---

Decisions locked for `docs/test-harness/engineering/engineering-doc.md` (keep consistent on revision):

1. **Standalone app, zero runtime coupling.** `apps/test-harness` (Next.js 14, App Router, TS strict, `@/` alias). NO live Supabase client, NO coupling to customer-app. Its only external dependency is the n8n webhook over HTTP. (User decision #1, notepad 94.)
2. **Data source = committed JSON fixture derived from seed SQL, not a live DB.** A builder-side one-time script `scripts/build-harness-fixture.ts` parses `supabase/seed/04/05/06` (using `pgsql-ast-parser` for robust INSERT parsing) and emits `apps/test-harness/fixtures/customers.json` (~30 customers + ordered backfilled history). Rejected alternatives: live DB read (couples to Supabase), ephemeral Postgres in build (adds DB dep), hand-rolled regex (brittle vs escaped quotes). Relative `now()` dates normalized to relative labels. (User decision #2.)
3. **Live AI only from the webhook response body.** POST the fixed contract (`business_id` from env `ACME_BUSINESS_ID`, unique `from_phone` per customer, `text`, `channel:sms`, optional `customer_name`, generated `message_id`); render returned `reply`/`intent`/`agent`/`actions`. No DB write-back, no polling. (User decision #3, contract `n8n-webhook-contract.md`.)
4. **Thin server-side proxy backend.** Route Handlers `/api/send`, `/api/batch`, `/api/health` (nodejs, force-dynamic, typed envelope mirroring customer-app). Jobs: keep `N8N_WEBHOOK_SECRET` server-only (never `NEXT_PUBLIC_`, browser calls only our `/api/*`, CSP `connect-src 'self'`), translate to contract, enforce graceful degradation. All env via `lib/env.ts`.
5. **Batch simulate = one button, all 50 eval cases + extras.** Fixture `scenarios.json` maps each `eval-cases.json` case to a seeded customer + caller_input + expected_intent; bounded-concurrency fan-out; results grid (expected vs returned intent, agent, latency, lenient pass/fail chip). Authoritative scoring stays in `apps/customer-app/tests/eval/` + Azure export — the harness only drives traffic (lenient chip is a demo aid, extras tagged expected_intent `*`).
6. **Demo-safety = graceful degradation.** Webhook down / env missing / timeout → soft `webhook_unavailable` envelope + non-blocking error bubble, OR offline-mock reply when `OFFLINE_MOCK=true`. Never hard-fails (mirrors website lead no-op + customer-app read-only demo).
7. **No auth, no DB, no own LLM, text-only, single org (Acme).** All AI lives in n8n; harness is a client. `media_url`/MMS out of scope (image understanding unsupported).
8. **Deploy = own Netlify site** (separate from website + customer-app), own `netlify.toml` (`base = apps/test-harness`, Node 20, `@netlify/plugin-nextjs`), local CLI deploy from `apps/test-harness` (NOT the MCP connector — same subdir-base reason as customer-app).
9. **Stage-6 live testing is gated** on the n8n workflow being imported + Active (+ schema migrated/seeded). Until then: stubbed webhooks (tests) / OFFLINE_MOCK (demo). Stated explicitly in doc §15.1.

**Why:** Resolves notepad §Test Harness scope with the fixed stack while honoring the three user-locked decisions and the existing fixed webhook contract.
**How to apply:** Preserve on revision; flag conflicts rather than diverge. See [[decisions-customer-app]] (sibling: contract + seed source), [[project-handled]] (overall).
