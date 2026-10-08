# Test Harness — Implementation Specs (Stage 2)

**App:** `test-harness` · **Location:** `apps/test-harness/` (to be scaffolded in Stage 3)
**Source of truth:** `docs/test-harness/engineering/engineering-doc.md` (approved Stage-1 HLD)
**Fixed external contract:** `docs/customer-app/implementation/n8n-webhook-contract.md`

> These are granular, buildable specs. No application code is written at Stage 2.
> Stage 3 (`/frontend-setup`) scaffolds the app; Stage 4 implements features against
> these specs, always applying `/design-system`.

---

## What this app is (one paragraph)

A standalone, SMS-style tester for the live Handled AI agent. It impersonates any of
Acme Plumbing's 30 backfilled end-customers, shows each one's backfilled text history
from a **committed JSON fixture** (no database), lets the operator send new messages
"as them" to the **one fixed n8n webhook**, renders the AI's reply as an inbound SMS
bubble (surfacing `intent`/`agent`/`actions`), and provides a **one-button batch** that
fires all 50 eval scenarios (plus extras) at the agent and shows a results grid. It is
fully decoupled: the only runtime dependency is outbound HTTP to the n8n webhook.

---

## Spec files (read in this order)

| # | Spec | Covers |
|---|---|---|
| 1 | [`project-setup.md`](./project-setup.md) | Next.js 14 scaffold, deps, tsconfig/`@/` alias, vitest/playwright config, npm scripts, Node 20, folder tree |
| 2 | [`env-and-config.md`](./env-and-config.md) | `lib/env.ts` central access, env var catalog, server-only secret rule, `/api/health` presence booleans |
| 3 | [`fixture-extraction.md`](./fixture-extraction.md) | **Data model (no DB).** `scripts/build-harness-fixture.ts` parser, join logic, date normalization, `fixtures/customers.json` schema, typed loaders |
| 4 | [`scenario-set.md`](./scenario-set.md) | `fixtures/scenarios.json` schema + the full 50-case → customer/intent mapping + extras + serialization grouping |
| 5 | [`webhook-proxy.md`](./webhook-proxy.md) | `lib/webhook/*`, Zod contract schemas, `/api/send` + `/api/batch`, typed envelope, **body-based `ok` classification**, timeout, concurrency+serialization |
| 6 | [`graceful-degradation.md`](./graceful-degradation.md) | Offline/mock mode vs degraded-but-200 replies (distinct), error states, `mock.ts`, never-hard-fail |
| 7 | [`chat-ui.md`](./chat-ui.md) | Pages/components, Zustand store, React Query hooks, UX states, a11y, SMS look, batch panel |
| 8 | [`design-system-setup.md`](./design-system-setup.md) | `globals.css` tokens, `tailwind.config.ts`, chip color maps for intents/agents/pass-fail |
| 9 | [`testing.md`](./testing.md) | Vitest unit/integration, Playwright E2E + axe, fixture-build test, Stage-6 live-n8n note |
| 10 | [`deployment.md`](./deployment.md) | `netlify.toml`, `next.config.mjs` security headers, own Netlify site, deploy method, Stage-6 prerequisite |
| — | [`.env.example`](./.env.example) | Canonical env template (copy to `apps/test-harness/.env.example`) |

---

## Why there is no `supabase-schema.sql`

The implementation-specs skill normally always emits `docs/<app>/implementation/supabase-schema.sql`.
**This app deliberately has no database** (locked decision #1 & #2 in the engineering doc:
"operates completely separately — no live Supabase connection, no coupling to the
customer-app"). Its entire data model is a committed JSON fixture derived once from the
customer-app's seed SQL. That fixture **is** the data model and is fully specified in
[`fixture-extraction.md`](./fixture-extraction.md) (schema, provenance, build script,
loaders). Emitting a SQL schema here would contradict the locked architecture and create
dead coupling. This omission is intentional and documented, mirroring how the website's
security plan was scoped down rather than templated.

---

## Verified-backend facts folded into these specs (as of 2026-10-08)

1. **The webhook is LIVE and reachable.** Auth header `X-Handled-Secret` is enforced.
2. **It ALWAYS returns HTTP 200 — even on failure.** A wrong/missing secret returns
   `HTTP 200` with body `{"ok":false,"error":"unauthorized"}` (fast, ~2s). So the proxy
   MUST classify success/failure on the **response body's `ok` field**, never the HTTP
   status. See `webhook-proxy.md` §4.
3. **Observed latency is HIGH: ~19–49 s per call**, not the ~3 s the engineering doc's
   SC-2 / contract "Latency target" assumed. Specs set a generous per-request timeout
   (default **60 s**) and loading UI that tolerates it. See `webhook-proxy.md` §3 and
   `deployment.md` §Env for the corrected `WEBHOOK_TIMEOUT_MS` default.
4. **Some agents return a degraded but well-formed 200** (e.g. the booking agent may
   reply `"Agent stopped due to max iterations"` with empty `actions`). The harness
   **faithfully displays whatever the webhook returns** and must NOT hide or special-case
   it — it is a testing tool. This is **distinct** from the offline/mock + error state,
   which is only for an **unreachable** webhook / missing env. See
   `graceful-degradation.md` §1.

---

## Build order (for Stage 3/4)

1. Scaffold (`project-setup.md`) → 2. `lib/env.ts` + `.env.example` (`env-and-config.md`)
→ 3. Run `scripts/build-harness-fixture.ts`, commit `fixtures/customers.json`
(`fixture-extraction.md`) → 4. Commit `fixtures/scenarios.json` (`scenario-set.md`)
→ 5. `lib/webhook/*` + validation + API routes (`webhook-proxy.md`, `graceful-degradation.md`)
→ 6. Design tokens (`design-system-setup.md`) → 7. UI (`chat-ui.md`) → 8. Tests (`testing.md`)
→ 9. Deploy config (`deployment.md`).

## Requirement coverage

Every engineering-doc requirement (TH-1…TH-20, ED §17) and every notepad/PRD intent is
traced to a spec in the per-file "Requirement coverage" callouts and summarized in
`testing.md` §Coverage matrix.
